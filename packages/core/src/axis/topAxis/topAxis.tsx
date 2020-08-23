import React, { FunctionComponent, memo, useCallback } from 'react';
import { Rect, Group, Line } from 'react-konva';
import Konva from 'konva';
import { TopTick } from './topTick';
import {
  DragInteraction,
  useDragInteraction,
} from '../../transform/_hooks/useDragInteraction';
import { useXTransformer } from '../../transform/_hooks/useXTransformer';
import { useDimension } from '../../dimension/useDimension';

const TopAxisComponent: FunctionComponent = () => {
  const { width, xAxisSize } = useDimension();

  const y = xAxisSize + 0.5;

  const { transform, setScale, setScaleOffset } = useXTransformer();

  const format = transform.tickFormat();

  const onDblClick = useCallback(() => {
    setScale(() => 0);
  }, [setScale]);

  const onMove: DragInteraction = useCallback(
    (event, point) => {
      const { clientX } = event;
      setScale((scale) => {
        return scale + clientX - point.x;
      });
    },
    [setScale],
  );

  const dragInteraction = useDragInteraction(onMove);
  const onMouseDown = useCallback((event: Konva.KonvaEventObject<MouseEvent>) => {
    const {offsetX} = event.evt;
    setScaleOffset(() => offsetX);
    dragInteraction(event);
  }, [dragInteraction])

  return (
    <Group onDblClick={onDblClick} onMouseDown={onMouseDown}>
      <Rect x={0} y={0} height={xAxisSize} width={width} fill="white" />
      <Line points={[0, y, width, y]} stroke="black" strokeWidth={1} />
      {transform.ticks().map((tick, index) => {
        const x = transform(tick);
        const text = format(tick);
        const key = `${x}:${y}:${index}`;

        return <TopTick key={key} x={x} y={y} text={text} />;
      })}
    </Group>
  );
};

export const TopAxis = memo(TopAxisComponent);
