# Gigflow API Documentation

This document describes the Gigflow Express API in a Swagger/OpenAPI-style format.

Base URL for local development:

```text
http://localhost:5000/api
```

Protected endpoints require:

```http
Authorization: Bearer <token>
```

The token is returned by `POST /auth/login`.

## Specification

```yaml
openapi: 3.0.3
info:
  title: Gigflow API
  version: 1.0.0
  description: REST API for Gigflow Smart Leads Dashboard.
servers:
  - url: http://localhost:5000/api
    description: Local development

tags:
  - name: Auth
    description: User registration, login, and current user endpoints
  - name: Leads
    description: Lead CRUD, filters, pagination, and CSV export

security:
  - bearerAuth: []

paths:
  /auth/register:
    post:
      tags: [Auth]
      summary: Register a user
      security: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/RegisterRequest"
            example:
              name: Aditi Sharma
              email: aditi@example.com
              password: password123
              role: sales
      responses:
        "201":
          description: User registered
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/UserSuccessResponse"
        "400":
          $ref: "#/components/responses/BadRequest"
        "500":
          $ref: "#/components/responses/ServerError"

  /auth/login:
    post:
      tags: [Auth]
      summary: Login and receive a bearer token
      security: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/LoginRequest"
            example:
              email: aditi@example.com
              password: password123
      responses:
        "200":
          description: Login successful
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/LoginSuccessResponse"
        "400":
          $ref: "#/components/responses/BadRequest"
        "401":
          $ref: "#/components/responses/Unauthorized"

  /auth/me:
    get:
      tags: [Auth]
      summary: Get the authenticated user
      responses:
        "200":
          description: Current user
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/UserSuccessResponse"
        "401":
          $ref: "#/components/responses/Unauthorized"

  /leads:
    get:
      tags: [Leads]
      summary: Get paginated leads
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            minimum: 1
            default: 1
        - name: limit
          in: query
          schema:
            type: integer
            minimum: 1
            maximum: 100
            default: 10
        - name: status
          in: query
          schema:
            $ref: "#/components/schemas/LeadStatus"
        - name: source
          in: query
          schema:
            $ref: "#/components/schemas/LeadSource"
        - name: search
          in: query
          schema:
            type: string
        - name: sort
          in: query
          schema:
            type: string
            enum: [latest, oldest]
            default: latest
      responses:
        "200":
          description: Paginated leads
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/PaginatedLeadsResponse"
        "401":
          $ref: "#/components/responses/Unauthorized"

    post:
      tags: [Leads]
      summary: Create a lead
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/CreateLeadRequest"
            example:
              name: Rahul Mehta
              email: rahul@example.com
              status: New
              source: Website
      responses:
        "201":
          description: Lead created
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/LeadSuccessResponse"
        "400":
          $ref: "#/components/responses/BadRequest"
        "401":
          $ref: "#/components/responses/Unauthorized"

  /leads/export/csv:
    get:
      tags: [Leads]
      summary: Export matching leads as CSV
      description: Admin only. Accepts the same filters as GET /leads.
      parameters:
        - name: status
          in: query
          schema:
            $ref: "#/components/schemas/LeadStatus"
        - name: source
          in: query
          schema:
            $ref: "#/components/schemas/LeadSource"
        - name: search
          in: query
          schema:
            type: string
        - name: sort
          in: query
          schema:
            type: string
            enum: [latest, oldest]
            default: latest
      responses:
        "200":
          description: CSV file
          content:
            text/csv:
              schema:
                type: string
                format: binary
        "401":
          $ref: "#/components/responses/Unauthorized"
        "403":
          $ref: "#/components/responses/Forbidden"

  /leads/{id}:
    get:
      tags: [Leads]
      summary: Get one lead
      parameters:
        - $ref: "#/components/parameters/LeadId"
      responses:
        "200":
          description: Lead detail
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/LeadSuccessResponse"
        "401":
          $ref: "#/components/responses/Unauthorized"
        "404":
          $ref: "#/components/responses/NotFound"

    patch:
      tags: [Leads]
      summary: Update a lead
      description: Admin can update all leads. Sales users can update their own leads.
      parameters:
        - $ref: "#/components/parameters/LeadId"
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/UpdateLeadRequest"
            example:
              status: Qualified
      responses:
        "200":
          description: Lead updated
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/LeadSuccessResponse"
        "400":
          $ref: "#/components/responses/BadRequest"
        "401":
          $ref: "#/components/responses/Unauthorized"
        "403":
          $ref: "#/components/responses/Forbidden"
        "404":
          $ref: "#/components/responses/NotFound"

    delete:
      tags: [Leads]
      summary: Delete a lead
      description: Admin only.
      parameters:
        - $ref: "#/components/parameters/LeadId"
      responses:
        "200":
          description: Lead deleted
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/DeleteSuccessResponse"
        "401":
          $ref: "#/components/responses/Unauthorized"
        "403":
          $ref: "#/components/responses/Forbidden"
        "404":
          $ref: "#/components/responses/NotFound"

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  parameters:
    LeadId:
      name: id
      in: path
      required: true
      schema:
        type: string
        format: uuid

  schemas:
    UserRole:
      type: string
      enum: [admin, sales]

    LeadStatus:
      type: string
      enum: [New, Contacted, Qualified, Lost]

    LeadSource:
      type: string
      enum: [Website, Instagram, Referral]

    RegisterRequest:
      type: object
      required: [name, email, password]
      properties:
        name:
          type: string
          minLength: 2
          maxLength: 60
        email:
          type: string
          format: email
        password:
          type: string
          minLength: 8
        role:
          $ref: "#/components/schemas/UserRole"

    LoginRequest:
      type: object
      required: [email, password]
      properties:
        email:
          type: string
          format: email
        password:
          type: string
          minLength: 1

    User:
      type: object
      required: [id, name, email, role]
      properties:
        id:
          type: string
          format: uuid
        name:
          type: string
        email:
          type: string
          format: email
        role:
          $ref: "#/components/schemas/UserRole"

    CreatedBy:
      type: object
      required: [id, name, email]
      properties:
        id:
          type: string
          format: uuid
        name:
          type: string
        email:
          type: string
          format: email

    Lead:
      type: object
      required: [id, name, email, status, source, createdBy, createdAt, updatedAt]
      properties:
        id:
          type: string
          format: uuid
        name:
          type: string
        email:
          type: string
          format: email
        status:
          $ref: "#/components/schemas/LeadStatus"
        source:
          $ref: "#/components/schemas/LeadSource"
        createdBy:
          $ref: "#/components/schemas/CreatedBy"
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time

    CreateLeadRequest:
      type: object
      required: [name, email, source]
      properties:
        name:
          type: string
          minLength: 2
          maxLength: 100
        email:
          type: string
          format: email
        status:
          $ref: "#/components/schemas/LeadStatus"
        source:
          $ref: "#/components/schemas/LeadSource"

    UpdateLeadRequest:
      type: object
      properties:
        name:
          type: string
          minLength: 2
          maxLength: 100
        email:
          type: string
          format: email
        status:
          $ref: "#/components/schemas/LeadStatus"
        source:
          $ref: "#/components/schemas/LeadSource"

    Pagination:
      type: object
      required: [total, page, limit, totalPages, hasNextPage, hasPrevPage]
      properties:
        total:
          type: integer
        page:
          type: integer
        limit:
          type: integer
        totalPages:
          type: integer
        hasNextPage:
          type: boolean
        hasPrevPage:
          type: boolean

    UserSuccessResponse:
      type: object
      required: [success, data]
      properties:
        success:
          type: boolean
          example: true
        data:
          $ref: "#/components/schemas/User"
        message:
          type: string

    LoginSuccessResponse:
      type: object
      required: [success, data]
      properties:
        success:
          type: boolean
          example: true
        data:
          type: object
          required: [token, user]
          properties:
            token:
              type: string
            user:
              $ref: "#/components/schemas/User"
        message:
          type: string

    LeadSuccessResponse:
      type: object
      required: [success, data]
      properties:
        success:
          type: boolean
          example: true
        data:
          $ref: "#/components/schemas/Lead"
        message:
          type: string

    PaginatedLeadsResponse:
      type: object
      required: [success, data, pagination]
      properties:
        success:
          type: boolean
          example: true
        data:
          type: array
          items:
            $ref: "#/components/schemas/Lead"
        pagination:
          $ref: "#/components/schemas/Pagination"

    DeleteSuccessResponse:
      type: object
      required: [success, data, message]
      properties:
        success:
          type: boolean
          example: true
        data:
          nullable: true
          example: null
        message:
          type: string
          example: Lead deleted.

    ErrorResponse:
      type: object
      required: [success, message]
      properties:
        success:
          type: boolean
          example: false
        message:
          type: string
        errors:
          type: array
          items:
            type: object
            properties:
              field:
                type: string
              message:
                type: string

  responses:
    BadRequest:
      description: Validation or bad request error
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/ErrorResponse"
    Unauthorized:
      description: Missing, invalid, or expired bearer token
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/ErrorResponse"
    Forbidden:
      description: Authenticated user does not have permission
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/ErrorResponse"
    NotFound:
      description: Resource not found
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/ErrorResponse"
    ServerError:
      description: Internal server error
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/ErrorResponse"
```

## Endpoint Summary

| Method | Path | Auth | Role | Purpose |
| --- | --- | --- | --- | --- |
| `POST` | `/api/auth/register` | No | Public | Create user and profile |
| `POST` | `/api/auth/login` | No | Public | Login and return bearer token |
| `GET` | `/api/auth/me` | Yes | Admin/Sales | Return current user |
| `GET` | `/api/leads` | Yes | Admin/Sales | List leads |
| `GET` | `/api/leads/:id` | Yes | Admin/Sales | Get one lead |
| `POST` | `/api/leads` | Yes | Admin/Sales | Create lead |
| `PATCH` | `/api/leads/:id` | Yes | Admin/Sales | Update lead. Sales can update own leads only |
| `DELETE` | `/api/leads/:id` | Yes | Admin | Delete lead |
| `GET` | `/api/leads/export/csv` | Yes | Admin | Export filtered leads as CSV |

## Common Response Shapes

Success:

```json
{
  "success": true,
  "data": {}
}
```

Paginated success:

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

Error:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "body.email",
      "message": "Invalid email"
    }
  ]
}
```

## Example Requests

Register:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Aditi Sharma\",\"email\":\"aditi@example.com\",\"password\":\"password123\",\"role\":\"admin\"}"
```

Login:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"aditi@example.com\",\"password\":\"password123\"}"
```

Create lead:

```bash
curl -X POST http://localhost:5000/api/leads \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d "{\"name\":\"Rahul Mehta\",\"email\":\"rahul@example.com\",\"status\":\"New\",\"source\":\"Website\"}"
```

List filtered leads:

```bash
curl "http://localhost:5000/api/leads?page=1&limit=10&status=Qualified&source=Instagram&sort=latest" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Delete lead:

```bash
curl -X DELETE http://localhost:5000/api/leads/LEAD_UUID \
  -H "Authorization: Bearer ADMIN_TOKEN"
```
