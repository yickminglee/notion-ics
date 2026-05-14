import { ICalEventBusyStatus } from 'ical-generator';
import type { QueryDataSourceParameters } from '@notionhq/client/build/src/api-endpoints';

export default {
	filter: {
	},
	dateProperty: 'Date',
	titleProperty: 'Event name',
	busy: ICalEventBusyStatus.BUSY
} as {
	filter: Readonly<QueryDataSourceParameters['filter']>;
	dateProperty: Readonly<string>;
	titleProperty: Readonly<string>;
	busy: Readonly<ICalEventBusyStatus>;
};
