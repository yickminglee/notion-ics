import ical from 'ical-generator';
import { getVtimezoneComponent } from '@touch4it/ical-timezones';

import { Client } from '@notionhq/client';
import type {
	DatabaseObjectResponse,
	QueryDataSourceResponse
} from '@notionhq/client/build/src/api-endpoints';

import config from '$lib/config';
import { ACCESS_KEY, NOTION_TOKEN } from '$env/static/private';
import type { RequestHandler } from './$types';

export const trailingSlash = 'never';

const notion = new Client({ auth: NOTION_TOKEN, notionVersion: '2025-09-03' });

export const GET: RequestHandler = async ({ params, url }) => {
	const secret = url.searchParams.get('secret');
	if (secret !== ACCESS_KEY) {
		return new Response('Forbidden', { status: 403 });
	}

	const { id } = params;

	const databaseMetadata = (await notion.databases.retrieve({
		database_id: id
	})) as DatabaseObjectResponse;
	const dataSource = databaseMetadata.data_sources[0];

	const databaseEntries = [];
	let query: QueryDataSourceResponse | { has_more: true; next_cursor: undefined } = {
		has_more: true,
		next_cursor: undefined
	};
	while (query.has_more) {
		query = await notion.dataSources.query({
			data_source_id: dataSource.id,
			page_size: 100,
			start_cursor: query.next_cursor,
			filter: config.filter
		});
		databaseEntries.push(...query.results);
	}

	const filtered: {
		id: string;
		title: string;
		date: { start: string; end: string | null; time_zone: string | null };
	}[] = databaseEntries.flatMap((object) => {
		if (object.properties[config.dateProperty].date === null) {
			return [];
		}
		return [
			{
				id: object.id,
				title: object.properties[config.titleProperty].title[0].text.content,
				date: object.properties[config.dateProperty].date
			}
		];
	});

	const calendar = ical({
		name: dataSource.name,
		prodId: { company: 'Ming', language: 'EN', product: 'notion-ics' }
	});
	calendar.timezone({
		name: 'Asia/Hong_Kong',
		generator: getVtimezoneComponent
	});
	filtered.forEach((event) => {
		calendar.createEvent({
			start: new Date(event.date.start),
			end: event.date.end ? new Date(event.date.end) : undefined,
			summary: event.title,
			busystatus: config.busy,
			id: event.id
		});
		const first = filtered[0];
		if (first) {
			console.log('raw start', first.date.start);
			console.log('raw end', first.date.end);
			console.log('parsed start', new Date(first.date.start).toISOString());
			console.log('parsed end', first.date.end ? new Date(first.date.end).toISOString() : null);
		}
	});

	return new Response(calendar.toString(), {
		status: 200,
		headers: {
			'content-type': 'text/calendar'
		}
	});
};
