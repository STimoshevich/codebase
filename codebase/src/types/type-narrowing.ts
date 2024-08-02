export type TKubexOptions =
  | { type: null | undefined; config: null }
  | { type: EWidgetType.BarChart; config: TBarChartComponentOption | null }
  | { type: EWidgetType.StackedBarChart; config: TStackedBarChartComponentOption | null }
  | { type: EWidgetType.DonutChart; config: TDonutChartComponentOption | null }
  | { type: EWidgetType.PieChart; config: TPieChartComponentOption | null }
  | { type: EWidgetType.Table; config: TTableComponentOption | null };

export type TKubexOptionsConfigByType<Type extends EWidgetType | null | undefined> = Extract<
  TKubexOptions,
  { type: Type }
>['config'];

export type IWidgetConfiguration = {
  name: string | null;
  dataSourceUrl: string | null;
  jsonDataPath: string | null;
  axisField: IField | null;
  legendField: IField | null;
  valueField: string | null;
  valueFieldAggregationFunction: EAggregationFunction | null;
  showValueInPercentages: boolean | null;
  total: IWidgetTotal | null;
  columns: ITableColumn[] | null;
} & TKubexOptions;
