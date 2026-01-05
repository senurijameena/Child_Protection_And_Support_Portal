
import { AxiosPromise } from 'axios';

export interface TimelineFilterData {
  [key: string]: any;
}

export interface TimelineEventData {
  [key: string]: any;
}

export const timelineService: {
  getCaseTimeline: (caseId: string) => AxiosPromise<any>;
  getHelpRequestTimeline: (helpRequestId: string) => AxiosPromise<any>;
  getFilteredTimeline: (filterData: TimelineFilterData) => AxiosPromise<any>;
  getRecentActivity: (limit?: number) => AxiosPromise<any>;
  getTimelineEvent: (eventId: string) => AxiosPromise<any>;
  getCaseEventCount: (caseId: string) => AxiosPromise<any>;
  createTimelineEvent: (eventData: TimelineEventData) => AxiosPromise<any>;
  deleteTimelineEvent: (eventId: string) => AxiosPromise<any>;
};

export const timelineAPI: typeof timelineService;

