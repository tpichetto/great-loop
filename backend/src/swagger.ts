import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Great Loop API',
    version: '1.0.0',
    description: 'API for landmark exploration application with geospatial features',
  },
  servers: [
    {
      url: 'http://localhost:4000/api/v1',
      description: 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token in the format: Bearer <token>',
      },
    },
    schemas: {
      User: {
        type: 'object',
        required: ['email', 'password_hash', 'first_name', 'last_name'],
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'Unique identifier',
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'User email address, must be unique',
          },
          password_hash: {
            type: 'string',
            description: 'Hashed password (not returned in responses)',
          },
          first_name: {
            type: 'string',
            description: 'User first name',
          },
          last_name: {
            type: 'string',
            description: 'User last name',
          },
          avatar_url: {
            type: 'string',
            format: 'url',
            nullable: true,
            description: 'URL to user avatar image',
          },
          created_at: {
            type: 'string',
            format: 'date-time',
            description: 'Timestamp of user creation',
          },
          updated_at: {
            type: 'string',
            format: 'date-time',
            description: 'Timestamp of last update',
          },
        },
      },
      Landmark: {
        type: 'object',
        required: ['name', 'description', 'latitude', 'longitude', 'category'],
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
          },
          name: {
            type: 'string',
          },
          description: {
            type: 'string',
          },
          latitude: {
            type: 'number',
            format: 'decimal',
            description: 'Latitude in decimal degrees',
          },
          longitude: {
            type: 'number',
            format: 'decimal',
            description: 'Longitude in decimal degrees',
          },
          location: {
            type: 'object',
            description: 'PostGIS geography point (automatically generated from lat/long)',
            nullable: true,
          },
          category: {
            type: 'string',
            enum: ['historical', 'natural', 'cultural', 'architectural', 'recreational'],
            description: 'Landmark category',
          },
          image_urls: {
            type: 'array',
            items: {
              type: 'string',
              format: 'url',
            },
            description: 'Array of image URLs',
          },
          opening_hours: {
            type: 'object',
            description: 'JSON object with opening hours by season or day',
            nullable: true,
          },
          admission_fee: {
            type: 'number',
            format: 'decimal',
            nullable: true,
            description: 'Admission fee in USD',
          },
          contact_info: {
            type: 'object',
            description: 'JSON object with phone, website, etc.',
            nullable: true,
          },
          created_at: {
            type: 'string',
            format: 'date-time',
          },
          updated_at: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      UserProgress: {
        type: 'object',
        required: ['user_id', 'landmark_id', 'status'],
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
          },
          user_id: {
            type: 'string',
            format: 'uuid',
            description: 'Reference to user',
          },
          landmark_id: {
            type: 'string',
            format: 'uuid',
            description: 'Reference to landmark',
          },
          visited_at: {
            type: 'string',
            format: 'date-time',
            nullable: true,
            description: 'When the landmark was visited',
          },
          status: {
            type: 'string',
            enum: ['discovered', 'visited', 'completed'],
            description: 'Progress status',
          },
          notes: {
            type: 'string',
            nullable: true,
            description: 'User notes about the visit',
          },
          created_at: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      Comment: {
        type: 'object',
        required: ['user_id', 'landmark_id', 'content'],
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
          },
          user_id: {
            type: 'string',
            format: 'uuid',
          },
          landmark_id: {
            type: 'string',
            format: 'uuid',
          },
          content: {
            type: 'string',
            description: 'Comment text',
          },
          rating: {
            type: 'integer',
            minimum: 1,
            maximum: 5,
            nullable: true,
            description: 'Rating from 1 to 5 stars',
          },
          helpful_count: {
            type: 'integer',
            default: 0,
            description: 'Number of users who found this helpful',
          },
          is_public: {
            type: 'boolean',
            default: true,
            description: 'Whether the comment is publicly visible',
          },
          created_at: {
            type: 'string',
            format: 'date-time',
          },
          updated_at: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
          },
          password: {
            type: 'string',
          },
        },
      },
      RegisterRequest: {
        type: 'object',
        required: ['email', 'password', 'first_name', 'last_name'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
          },
          password: {
            type: 'string',
            minLength: 8,
            description: 'Password (min 8 characters)',
          },
          first_name: {
            type: 'string',
          },
          last_name: {
            type: 'string',
          },
        },
      },
      TokenResponse: {
        type: 'object',
        required: ['access_token', 'refresh_token', 'expires_in'],
        properties: {
          access_token: {
            type: 'string',
            description: 'JWT access token',
          },
          refresh_token: {
            type: 'string',
            description: 'JWT refresh token',
          },
          expires_in: {
            type: 'integer',
            description: 'Expiration time in seconds',
          },
        },
      },
      Pagination: {
        type: 'object',
        required: ['total', 'limit', 'offset'],
        properties: {
          total: {
            type: 'integer',
            description: 'Total number of items',
          },
          limit: {
            type: 'integer',
            description: 'Items per page',
          },
          offset: {
            type: 'integer',
            description: 'Number of items skipped',
          },
          page: {
            type: 'integer',
            nullable: true,
            description: 'Current page number (computed)',
          },
        },
      },
      ErrorResponse: {
        type: 'object',
        required: ['error'],
        properties: {
          error: {
            type: 'string',
            description: 'Error message',
          },
          code: {
            type: 'string',
            nullable: true,
            description: 'Error code',
          },
        },
      },
    },
  },
};

const options = {
  swaggerDefinition,
  apis: ['./src/routes/**/*.ts'], // Path to the files containing JSDoc annotations (relative to cwd)
};

const swaggerSpec = swaggerJSDoc(options);

export { swaggerSpec };
