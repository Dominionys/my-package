import React, {
  FunctionComponent,
  memo,
  useCallback,
  useState,
  useMemo,
} from 'react';
import { Layer, Rect, Ring, Stage } from 'react-konva';
import { Weather, weatherList } from 'data';
import { extent } from 'd3-array';
import { scaleLinear, scaleSequential } from 'd3-scale';
import { interpolateRainbow } from 'd3-scale-chromatic';
import {
  DimensionContext,
  InteractiveStage,
  useTransformerState,
  XTransformerContext,
  YTransformerContext,
} from 'core';
import { HistogramProps } from './marginalHistogram.interface';
import { Dots } from './_components/dots';
import { XAxis } from './_components/xAxis';
import { YAxis } from './_components/yAxis';
import {
  AccessorsContext,
  ColorScaleContext,
  HoverPointContext,
  Point,
  SetHoverPointContext,
} from './marginalHistogram.constant';
import { TopHistogram } from './_components/topHistogram';
import { RightHistogram } from './_components/rightHistogram';
import { Voronoi } from './_components/voronoi';

const MarginalHistogramComponent: FunctionComponent<HistogramProps> = (
  props,
) => {
  const { width, height } = props;
  const yAxisSize = 50;
  const xAxisSize = 50;

  const accessors = useMemo(
    () => ({
      xAccessor: (weather: Weather) => weather.temperatureMin,
      yAccessor: (weather: Weather) => weather.temperatureMax,
      colorAccessor: (weather: Weather) => new Date(weather.date),
    }),
    [],
  );

  const dateExtent = useMemo(() => {
    const [left, right] = extent(weatherList.map(accessors.colorAccessor));
    return [left?.getTime() ?? 0, right?.getTime() ?? 0];
  }, [accessors]);

  const temperaturesExtent = useMemo(() => {
    const [left, right] = extent([
      ...weatherList.map(accessors.xAccessor),
      ...weatherList.map(accessors.yAccessor),
    ]);

    return [left ?? 0, right ?? 0];
  }, [accessors]);

  const dimension = useMemo(
    () => ({
      width,
      height,
      yAxisSize,
      xAxisSize,
    }),
    [width, height, xAxisSize, yAxisSize],
  );

  const xTransformerConfig = useMemo(
    () => ({
      scale: scaleLinear()
        .domain(temperaturesExtent)
        .range([yAxisSize + 15, width - 15 ?? 0])
        .nice(),
    }),
    [temperaturesExtent, width, yAxisSize],
  );

  const xTransformer = useTransformerState(xTransformerConfig);

  const yTransformerConfig = useMemo(
    () => ({
      scale: scaleLinear()
        .domain(temperaturesExtent)
        .range([(height ?? 0) - xAxisSize, 15])
        .nice(),
    }),
    [temperaturesExtent, height, xAxisSize],
  );

  const yTransformer = useTransformerState(yTransformerConfig);

  const colorScale = useMemo(
    () =>
      scaleSequential()
        .domain(dateExtent)
        .interpolator((d) => interpolateRainbow(-d)),
    [dateExtent],
  );

  const [point, setPoint] = useState<Point | undefined>(undefined);

  const setPointContext = useCallback(
    (nextPoint: Point | undefined) => setPoint(() => nextPoint),
    [setPoint],
  );

  const containerStyle = {
    backgroundColor: '#f8f9fa',
    height: height * 1.2,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  };

  const columnStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
  };

  const rowStyle = {
    display: 'flex',
    alignItems: 'flex-end',
  };

  const onMouseLeave = useCallback(() => {
    setPoint(undefined);
  }, [setPoint]);

  return (
    <div style={containerStyle}>
      <div style={rowStyle}>
        <div style={columnStyle}>
          <Stage width={dimension.width} height={80}>
            <HoverPointContext.Provider value={point}>
              <XTransformerContext.Provider value={xTransformer}>
                <AccessorsContext.Provider value={accessors}>
                  <Layer>
                    <TopHistogram weatherList={weatherList} />
                  </Layer>
                </AccessorsContext.Provider>
              </XTransformerContext.Provider>
            </HoverPointContext.Provider>
          </Stage>

          <DimensionContext.Provider value={dimension}>
            <XTransformerContext.Provider value={xTransformer}>
              <YTransformerContext.Provider value={yTransformer}>
                <InteractiveStage onMouseLeave={onMouseLeave}>
                  <SetHoverPointContext.Provider value={setPointContext}>
                    <ColorScaleContext.Provider value={colorScale}>
                      <AccessorsContext.Provider value={accessors}>
                        <Layer>
                          <Rect width={width} height={height} fill="white" />
                          <Dots weatherList={weatherList} />
                          <Voronoi weatherList={weatherList} />
                          {point && (
                            <Ring
                              x={point.x}
                              y={point.y}
                              innerRadius={7}
                              outerRadius={9}
                              fill="#6F1E51"
                            />
                          )}
                        </Layer>
                        <Layer>
                          <XAxis />
                          <YAxis />
                        </Layer>
                      </AccessorsContext.Provider>
                    </ColorScaleContext.Provider>
                  </SetHoverPointContext.Provider>
                </InteractiveStage>
              </YTransformerContext.Provider>
            </XTransformerContext.Provider>
          </DimensionContext.Provider>
        </div>

        <Stage width={80} height={dimension.height}>
          <HoverPointContext.Provider value={point}>
            <YTransformerContext.Provider value={yTransformer}>
              <AccessorsContext.Provider value={accessors}>
                <Layer x={80} rotation={90}>
                  <RightHistogram weatherList={weatherList} />
                </Layer>
              </AccessorsContext.Provider>
            </YTransformerContext.Provider>
          </HoverPointContext.Provider>
        </Stage>
      </div>
    </div>
  );
};

export const MarginalHistogram = memo(MarginalHistogramComponent);
