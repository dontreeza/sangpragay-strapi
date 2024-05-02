import { has, toNumber } from 'lodash/fp';

import { errors, pagination } from '@strapi/utils';

interface BasePaginationParams {
  withCount?: boolean | 't' | '1' | 'true' | 'f' | '0' | 'false' | 0 | 1;
}

type PagedPagination = BasePaginationParams & {
  page?: number;
  pageSize?: number;
};

type OffsetPagination = BasePaginationParams & {
  start?: number;
  limit?: number;
};

export type PaginationParams = PagedPagination | OffsetPagination;

type PaginationInfo =
  | {
      page: number;
      pageSize: number;
    }
  | {
      start: number;
      limit: number;
    };

/**
 * Default limit values from config
 */
const getLimitConfigDefaults = () => ({
  defaultLimit: toNumber(strapi.config.get('api.rest.defaultLimit', 25)),
  maxLimit: toNumber(strapi.config.get('api.rest.maxLimit')) || null,
});

const isPagedPagination = (pagination?: PaginationParams): pagination is PagedPagination =>
  has('page', pagination) || has('pageSize', pagination);

const shouldCount = (params: { pagination?: PaginationParams }) => {
  if (has('pagination.withCount', params)) {
    const withCount = params.pagination?.withCount;

    if (typeof withCount === 'boolean') {
      return withCount;
    }

    if (typeof withCount === 'undefined') {
      return false;
    }

    if (['true', 't', '1', 1].includes(withCount)) {
      return true;
    }

    if (['false', 'f', '0', 0].includes(withCount)) {
      return false;
    }

    throw new errors.ValidationError(
      'Invalid withCount parameter. Expected "t","1","true","false","0","f"'
    );
  }

  return Boolean(strapi.config.get('api.rest.withCount', true));
};

const getPaginationInfo = (params: { pagination?: PaginationParams }): PaginationInfo => {
  const { defaultLimit, maxLimit } = getLimitConfigDefaults();

  const { start, limit } = pagination.withDefaultPagination(params.pagination || {}, {
    defaults: { offset: { limit: defaultLimit }, page: { pageSize: defaultLimit } },
    maxLimit: maxLimit || -1,
  });

  return { start, limit };
};

const transformPaginationResponse = (
  paginationInfo: PaginationInfo,
  count: number,
  isPaged: boolean
) => {
  if (isPaged) {
    return pagination.transformPagedPaginationInfo(paginationInfo, count);
  }

  return pagination.transformOffsetPaginationInfo(paginationInfo, count);
};

export { isPagedPagination, shouldCount, getPaginationInfo, transformPaginationResponse };
