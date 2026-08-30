import { endpoints } from '@/shared/api/endpoints';
import type { CurrentSituation } from '@/shared/api/types';

/**
 * 게시판 구분은 서버 API가 세 벌로 나뉘어 있어 탭 값을 그대로 엔드포인트에 매핑한다.
 */
export type CommunityTab = 'all' | 'pre-dispatch' | 'dispatched';

export const COMMUNITY_TABS: { value: CommunityTab; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'pre-dispatch', label: '파견 전' },
  { value: 'dispatched', label: '파견 중' },
];

const LIST_ENDPOINT: Record<CommunityTab, string> = {
  all: endpoints.freePost.list,
  'pre-dispatch': endpoints.freePost.preDispatch,
  dispatched: endpoints.freePost.dispatched,
};

const SEARCH_ENDPOINT: Record<CommunityTab, string> = {
  all: endpoints.freePost.search,
  'pre-dispatch': endpoints.freePost.preDispatchSearch,
  dispatched: endpoints.freePost.dispatchedSearch,
};

export function communityEndpoint(tab: CommunityTab, keyword: string): string {
  return keyword.trim() === '' ? LIST_ENDPOINT[tab] : SEARCH_ENDPOINT[tab];
}

export function isCommunityTab(value: string | null): value is CommunityTab {
  return value === 'all' || value === 'pre-dispatch' || value === 'dispatched';
}

/** 파견 중인 회원에게는 파견 중 게시판을, 그 밖에는 파견 전 게시판을 먼저 보여준다 */
export function defaultCommunityTab(situation: CurrentSituation | null | undefined): CommunityTab {
  return situation === 'DISPATCHED' ? 'dispatched' : 'pre-dispatch';
}
