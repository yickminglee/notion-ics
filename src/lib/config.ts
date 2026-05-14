import { ICalEventBusyStatus } from 'ical-generator';
import type { QueryDataSourceParameters } from '@notionhq/client/build/src/api-endpoints';

export default {
  filter: undefined,
	dateProperty: 'Date',
	titleProperty: 'Event name',
	busy: ICalEventBusyStatus.BUSY
} as {
	filter: QueryDataSourceParameters['filter'] | undefined;
	dateProperty: Readonly<string>;
	titleProperty: Readonly<string>;
	busy: Readonly<ICalEventBusyStatus>;
};
