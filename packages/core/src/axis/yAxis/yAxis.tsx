import React, { FunctionComponent, memo, useCallback } from 'react';
import { Rect, Group, Line } from 'react-konva';
import { YTick } from './yTick';
import {
  DragInteraction,
  useDragInteraction,
} from '../../transform/_hooks/useDragInteraction';
import { useYTransformer } from '../../transform/_hooks/useYTransformer';
import { useDimension } from '../../dimension/useDimension';

const YAxisComponent: FunctionComponent = () => {
  const { width, height, yAxisSize } = useDimension();
  const x = width - yAxisSize + 0.5;

  const { transform, setScale } = useYTransformer();

  const format = transform.tickFormat();

  const onDblClick = useCallback(() => {
    setScale(() => 0);
  }, [setScale]);

  const onMove: DragInteraction = useCallback(
    (event, point) => {
      const { clientY } = event;
      setScale((scale) => {
        return scale + clientY - point.y;
      });
    },
    [setScale],
  );

  const onMouseDown = useDragInteraction(onMove);

  return (
    <Group onDblClick={onDblClick} onMouseDown={onMouseDown}>
      <Rect x={x} y={0} height={height} width={yAxisSize} fill="white" />
      <Line points={[x, 0, x, height]} stroke="black" strokeWidth={1} />
      {transform.ticks().map((tick) => {
        const y = transform(tick);
        const text = format(tick);
        const key = `${x}:${y}`;

        return <YTick key={key} x={x} y={y} text={text} />;
      })}
    </Group>
  );
};

export const YAxis = memo(YAxisComponent);