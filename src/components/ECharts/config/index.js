import * as echarts from "echarts/core";
import { BarChart, LineChart, LinesChart, PieChart, ScatterChart, RadarChart, GaugeChart } from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  LegendComponent,
  PolarComponent,
  GeoComponent,
  ToolboxComponent,
  DataZoomComponent
} from "echarts/components";
import { LabelLayout, UniversalTransition } from "echarts/features";
import { CanvasRenderer } from "echarts/renderers";
import "echarts-liquidfill";

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  LegendComponent,
  PolarComponent,
  GeoComponent,
  ToolboxComponent,
  DataZoomComponent,
  BarChart,
  LineChart,
  LinesChart,
  PieChart,
  ScatterChart,
  RadarChart,
  GaugeChart,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer
]);

export default echarts;
