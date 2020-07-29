import React, { FunctionComponent, memo, useCallback } from 'react';
import { Rect, Group, Line } from 'react-konva';
import { XTick } from './xTick';
import {
  DragInteraction,
  useDragInteraction,
} from '../../transform/_hooks/useDragInteraction';
import { useXTransformer } from '../../transform/_hooks/useXTransformer';
import { useDimension } from '../../dimension/useDimension';

const XAxisComponent: FunctionComponent = () => {
  const { width, height, xAxisSize } = useDimension();

  const y = height - xAxisSize + 0.5;

  const { transform, setScale } = useXTransformer();

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

  const onMouseDown = useDragInteraction(onMove);

  return (
    <Group onDblClick={onDblClick} onMouseDown={onMouseDown}>
      <Rect x={0} y={y} height={xAxisSize} width={width} fill="white" />
      <Line points={[0, y, width, y]} stroke="black" strokeWidth={1} />
      {transform.ticks().map((tick) => {
        const x = transform(tick);
        const text = format(tick);
        const key = `${x}:${y}`;

        return <XTick key={key} x={x} y={y} text={text} />;
      })}
    </Group>
  );
};

export const XAxis = memo(XAxisComponent);
