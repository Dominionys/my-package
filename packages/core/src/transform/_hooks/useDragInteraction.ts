import { useCallback, useRef, useMemo } from 'react';
import Konva from 'konva';
import { Point } from '../transform.interface';
import { rafDebounce } from '../../utils/rafDebounce';

export type DragInteraction = (event: MouseEvent, prevPoint: Point) => void;

export const useDragInteraction = (callback: DragInteraction) => {
  const point = useRef<Point | null>(null);

  const onMouseMove = useMemo(
    () =>
      rafDebounce((event: MouseEvent) => {
        const { clientX, clientY } = event;

        callback(event, point.current ?? { x: 0, y: 0 });

        point.current = {
          x: clientX,
          y: clientY,
        };
      }),
    [point, callback],
  );

  return useCallback(
    (event: Konva.KonvaEventObject<MouseEvent>) => {
      // eslint-disable-next-line no-param-reassign
      event.cancelBubble = true;
      const { clientX, clientY } = event.evt;
      point.current = {
        x: clientX,
        y: clientY,
      };

      const onMouseUp = () => {
        onMouseMove.cancel();

        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    },
    [point, onMouseMove],
  );
};
