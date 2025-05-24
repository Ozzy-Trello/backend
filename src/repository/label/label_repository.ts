import db from '@/database';
import { v4 as uuidv4 } from 'uuid';
import { StatusCodes } from 'http-status-codes';
import { ResponseData, ResponseListData } from '@/utils/response_utils';
import { Paginate } from '@/utils/data_utils';
import { LabelAttributes } from '@/database/schemas/label';
import { LabelRepositoryI, filterLabelDetail } from './label_interfaces';
import { ExpressionBuilder } from 'kysely';

export class LabelRepository implements LabelRepositoryI {
  createValueFilter(eb: ExpressionBuilder<any, any>, filter: filterLabelDetail) {
    let query = eb.and([]);
    if (filter.id) query = eb.and([query, eb('id', '=', filter.id)]);
    if (filter.name) query = eb.and([query, eb('name', '=', filter.name)]);
    if (filter.value) query = eb.and([query, eb('value', '=', filter.value)]);
    if (filter.value_type) query = eb.and([query, eb('value_type', '=', filter.value_type)]);
    // OR conditions
    const orConditions = [];
    if (filter.__orId) orConditions.push(eb('id', '=', filter.__orId));
    if (filter.__orName) orConditions.push(eb('name', '=', filter.__orName));
    if (filter.__orValue) orConditions.push(eb('value', '=', filter.__orValue));
    if (filter.__orValueType) orConditions.push(eb('value_type', '=', filter.__orValueType));
    if (orConditions.length > 0) {
      query = eb.and([query, eb.or(orConditions)]);
    }
    // NOT conditions
    const notConditions = [];
    if (filter.__notId) notConditions.push(eb('id', '!=', filter.__notId));
    if (filter.__notName) notConditions.push(eb('name', '!=', filter.__notName));
    if (filter.__notValue) notConditions.push(eb('value', '!=', filter.__notValue));
    if (filter.__notValueType) notConditions.push(eb('value_type', '!=', filter.__notValueType));
    if (notConditions.length > 0) {
      query = eb.and([query, ...notConditions]);
    }
    return query;
  }

  async createLabel(data: Omit<LabelAttributes, 'id' | 'created_at' | 'updated_at'>): Promise<ResponseData<LabelAttributes>> {
    const id = uuidv4();
    const now = new Date();
    await db.insertInto('label').values({
      id,
      name: data.name,
      value: data.value,
      value_type: data.value_type,
      created_at: now,
      updated_at: now,
    }).execute();
    const label = await db.selectFrom('label').selectAll().where('id', '=', id).executeTakeFirst();
    return new ResponseData({
      status_code: StatusCodes.OK,
      message: 'Label created',
      data: label as LabelAttributes,
    });
  }

  async getLabel(filter: filterLabelDetail): Promise<ResponseData<LabelAttributes>> {
    const label = await db.selectFrom('label').selectAll().where((eb) => this.createValueFilter(eb, filter)).executeTakeFirst();
    if (!label) {
      return new ResponseData({ status_code: StatusCodes.NOT_FOUND, message: 'Label not found' });
    }
    return new ResponseData({ status_code: StatusCodes.OK, message: 'OK', data: label as LabelAttributes });
  }

  async getLabels(filter: filterLabelDetail, paginate: Paginate): Promise<ResponseListData<LabelAttributes[]>> {
    const total = await db.selectFrom('label').select(({ fn }) => fn.count('id').as('count')).where((eb) => this.createValueFilter(eb, filter)).executeTakeFirst();
    paginate.setTotal(Number(total?.count ?? 0));
    const rows = await db.selectFrom('label')
      .selectAll()
      .where((eb) => this.createValueFilter(eb, filter))
      .orderBy('created_at', 'asc')
      .offset(paginate.getOffset())
      .limit(paginate.limit)
      .execute();
    return new ResponseListData({ status_code: StatusCodes.OK, message: 'OK', data: rows as LabelAttributes[] }, paginate);
  }

  async updateLabel(id: string, data: Partial<LabelAttributes>): Promise<ResponseData<LabelAttributes>> {
    const label = await db.selectFrom('label').selectAll().where('id', '=', id).executeTakeFirst();
    if (!label) {
      return new ResponseData({ status_code: StatusCodes.NOT_FOUND, message: 'Label not found' });
    }
    await db.updateTable('label').set({
      ...data,
      updated_at: new Date(),
    }).where('id', '=', id).execute();
    const updated = await db.selectFrom('label').selectAll().where('id', '=', id).executeTakeFirst();
    return new ResponseData({ status_code: StatusCodes.OK, message: 'Label updated', data: updated as LabelAttributes });
  }

  async deleteLabel(id: string): Promise<ResponseData<null>> {
    const label = await db.selectFrom('label').selectAll().where('id', '=', id).executeTakeFirst();
    if (!label) {
      return new ResponseData({ status_code: StatusCodes.NOT_FOUND, message: 'Label not found' });
    }
    await db.deleteFrom('label').where('id', '=', id).execute();
    return new ResponseData({ status_code: StatusCodes.NO_CONTENT, message: 'Label deleted' });
  }
}
