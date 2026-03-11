/**
 * Success response handler
 * @param {Object} res - Express response object
 * @param {*} data - Data to be sent in the response
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code (default: 200)
 * @returns {Object} - Response object
 */
const successResponse = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    status: 'success',
    message,
    data
  });
};

/**
 * Error response handler
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {Array} errors - Array of error objects (optional)
 * @returns {Object} - Response object
 */
const errorResponse = (res, message = 'An error occurred', statusCode = 500, errors = []) => {
  return res.status(statusCode).json({
    status: 'error',
    message,
    ...(errors.length > 0 && { errors })
  });
};

/**
 * Validation error response handler
 * @param {Object} res - Express response object
 * @param {Array} errors - Array of validation error objects
 * @param {string} message - Error message (default: 'Validation failed')
 * @returns {Object} - Response object
 */
const validationError = (res, errors, message = 'Validation failed') => {
  return res.status(400).json({
    status: 'error',
    message,
    errors: Array.isArray(errors) ? errors : [errors]
  });
};

/**
 * Not found response handler
 * @param {Object} res - Express response object
 * @param {string} message - Error message (default: 'Resource not found')
 * @returns {Object} - Response object
 */
const notFoundResponse = (res, message = 'Resource not found') => {
  return res.status(404).json({
    status: 'error',
    message
  });
};

/**
 * Unauthorized response handler
 * @param {Object} res - Express response object
 * @param {string} message - Error message (default: 'Unauthorized')
 * @returns {Object} - Response object
 */
const unauthorizedResponse = (res, message = 'Unauthorized') => {
  return res.status(401).json({
    status: 'error',
    message
  });
};

/**
 * Forbidden response handler
 * @param {Object} res - Express response object
 * @param {string} message - Error message (default: 'Forbidden')
 * @returns {Object} - Response object
 */
const forbiddenResponse = (res, message = 'Forbidden') => {
  return res.status(403).json({
    status: 'error',
    message
  });
};

/**
 * Bad request response handler
 * @param {Object} res - Express response object
 * @param {string} message - Error message (default: 'Bad request')
 * @returns {Object} - Response object
 */
const badRequestResponse = (res, message = 'Bad request') => {
  return res.status(400).json({
    status: 'error',
    message
  });
};

/**
 * Created response handler (201)
 * @param {Object} res - Express response object
 * @param {*} data - Created resource data
 * @param {string} message - Success message (default: 'Resource created successfully')
 * @returns {Object} - Response object
 */
const createdResponse = (res, data, message = 'Resource created successfully') => {
  return res.status(201).json({
    status: 'success',
    message,
    data
  });
};

/**
 * No content response handler (204)
 * @param {Object} res - Express response object
 * @returns {Object} - Empty response with 204 status
 */
const noContentResponse = (res) => {
  return res.status(204).send();
};

/**
 * Paginated response handler
 * @param {Object} res - Express response object
 * @param {Array} data - Array of items
 * @param {number} page - Current page number
 * @param {number} limit - Number of items per page
 * @param {number} total - Total number of items
 * @param {string} message - Success message (default: 'Success')
 * @returns {Object} - Paginated response object
 */
const paginatedResponse = (res, data, page, limit, total, message = 'Success') => {
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;
  
  return res.status(200).json({
    status: 'success',
    message,
    data,
    pagination: {
      total,
      totalPages,
      currentPage: page,
      pageSize: data.length,
      hasNext,
      hasPrev,
      nextPage: hasNext ? page + 1 : null,
      prevPage: hasPrev ? page - 1 : null
    }
  });
};

module.exports = {
  successResponse,
  errorResponse,
  validationError,
  notFoundResponse,
  unauthorizedResponse,
  forbiddenResponse,
  badRequestResponse,
  createdResponse,
  noContentResponse,
  paginatedResponse
};
