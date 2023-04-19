import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { apiHelpers, arrayHelpers } from '../helpers';
import { EnvLoader } from '../loader';
import { DataSourceOptions, DataSourceResult } from '../models';
import { ResourceService } from './resource.service';

@Injectable({
  providedIn: 'root',
})
export class DataSourcesService extends ResourceService<any> {
  constructor(
    protected override httpClient: HttpClient,
    protected override currentLoader: EnvLoader,
  ) {
    super(httpClient, currentLoader);
  }

  getApiVersions(): string {
    return apiHelpers.API_V_3;
  }

  getResourceUrl(): string {
    return 'dataproviders';
  }

  getDataSource(): Observable<DataSourceResult[]> {
    return super.get().pipe(map((data) => data.results));
  }

  combineDataSource(providersData: any, dataSources: any, surveyList: any): any {
    const controls: any[] = [];
    for (const dataSourceKey in providersData.providers) {
      const item = dataSources.find((el: { id: string }) => el.id === dataSourceKey);

      if (item) {
        const dataSourceDataItem = providersData[item.id];

        for (const dataKey in item.options) {
          const key = dataKey as string;
          const ctrl = item.options[key as keyof DataSourceOptions];
          if (ctrl?.rules) {
            ctrl.control_rules = ctrl.rules.map((el: string) => ({ [el]: true }));
          }
          ctrl!.control_label = dataKey;
          if (dataSourceDataItem?.hasOwnProperty(dataKey) && dataSourceKey === item.id) {
            ctrl!.control_value = dataSourceDataItem[dataKey] || null;
          }
        }
        item.control_options = Object.values(item.options);
        item.available_provider = providersData.providers[dataSourceKey] || false;
        item.visible_survey = !!providersData[dataSourceKey]?.form_id;
        item.form_id = providersData[dataSourceKey]?.form_id || null;
        item.selected_survey =
          surveyList.find((el: any) => el.id === providersData[dataSourceKey]?.form_id) || null;

        const inboundFieldsArr: any[] = [];
        for (const dataKey in item.inbound_fields) {
          inboundFieldsArr.push({
            control_label: dataKey.toLowerCase(),
            type: item.inbound_fields[dataKey],
            key: dataKey,
            control_value: providersData[dataSourceKey]?.inbound_fields
              ? providersData[dataSourceKey]?.inbound_fields[dataKey]
              : null,
          });
        }
        item.control_inbound_fields = inboundFieldsArr;
        controls.push(item);
      }
    }
    return arrayHelpers.sortArray(controls);
  }
}