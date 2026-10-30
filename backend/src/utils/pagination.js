export const getPagination = (query, defaultLimit = 12) => {
     const page = Math.max(parseInt(query.page, 10) || 1, 1);
     const limit = Math.min(
          Math.max(parseInt(query.limit, 10) || defaultLimit, 1),
          50,
     );
     return { page, limit, skip: (page - 1) * limit };
};

export const buildPaginationMeta = (total, page, limit) => ({
     total,
     page,
     limit,
     totalPages: Math.ceil(total / limit),
});
