## Summary

Implemented comprehensive OpenAPI 3.0 API documentation using swagger-jsdoc and swagger-ui-express. All endpoints are now fully documented with JSDoc annotations, enabling auto-generated interactive documentation at `/api-docs`.

## Changes Made

### Backend Setup

- Added dependencies: `swagger-jsdoc`, `swagger-ui-express`, `@types/swagger-jsdoc`
- Created `swagger.ts` configuration with:
  - API metadata (title, version, description)
  - Complete component schemas (User, Landmark, UserProgress, Comment, etc.)
  - Security scheme for JWT bearer authentication
  - Pagination and error response schemas
- Updated `app.ts` to:
  - Serve Swagger UI at `/api-docs`
  - Expose raw spec at `/api-docs.json`
  - Restructure routes under versioned path `/api/v1`

### Complete Route Documentation

Added JSDoc annotations to all route files:

- **auth.routes.ts**: register, login, logout, refresh (with JWT examples)
- **landmarks.routes.ts**: list (with filtering, pagination, geo-search), get, create, update, delete (admin)
- **progress.routes.ts**: list, get, create, update, delete for user progress tracking
- **comments.routes.ts**: list, get, create, update, delete, and mark as helpful
- **users.routes.ts**: profile management and public user info

Each endpoint includes:

- Summary and detailed description
- Parameter specifications (path, query, body) with types, constraints, and examples
- Request/response schemas with concrete examples
- All possible response status codes (200, 201, 204, 400, 401, 403, 404, 500)
- Authentication requirements where applicable

## Implementation Details

- **JSDoc-based approach**: Keeps documentation close to code, automatically regenerates on changes
- **OpenAPI 3.0**: Modern specification with full component reusability
- **API versioning**: All endpoints under `/api/v1` for future compatibility
- **Interactive docs**: Developers can explore and test API directly from browser via Swagger UI
- **Consistent schemas**: Shared component definitions ensure uniform data structures
- **Error handling**: Standardized error response format: `{ "error": "message", "code?" : "ERROR_CODE" }`
- **Pagination**: Documented with total, limit, offset, and computed page fields

## Testing

The Swagger UI can be accessed at `http://localhost:4000/api-docs` when the backend is running. All endpoints support the "Try it out" feature, with authentication handled via JWT bearer token.

## Acceptance Criteria Met

✅ OpenAPI spec generated automatically from code
✅ Swagger UI accessible at `/api-docs`
✅ All endpoints documented with request/response examples
✅ Authentication flow explained (JWT in Authorization header)
✅ API version in path (`/api/v1`)
✅ Documentation validates without errors
✅ "Try it out" works for authenticated endpoints

This PR was written using [Vibe Kanban](https://vibekanban.com)
