import { useEffect, useRef, useState } from 'react';
import { Trash2 } from 'lucide-react';

const TrashIcon = () => {
  const [trashScale, setTrashScale] = useState(1);
  const trashRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!trashRef.current) return;

      const trashRect = trashRef.current.getBoundingClientRect();
      const trashCenterX = trashRect.left + trashRect.width / 2;
      const trashCenterY = trashRect.top + trashRect.height / 2;

      const distance = Math.sqrt(
        Math.pow(event.clientX - trashCenterX, 2) +
        Math.pow(event.clientY - trashCenterY, 2)
      );

      const minDistance = 150; // NEW MIN DISTANCE
      const maxDistance = 350; // NEW MAX DISTANCE

      if (distance <= maxDistance && distance >= minDistance) {
        // Scale factor: max at 150px, min at 350px
        const scale = 1 + (2 - 1) * (1 - (distance - minDistance) / (maxDistance - minDistance));
        setTrashScale(scale);
      } else if (distance < minDistance) {
        setTrashScale(2); // Max scale at min distance
      } else {
        setTrashScale(1); // Default size beyond max distance
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      ref={trashRef}
      id="trash-icon"
      className="fixed bottom-6 right-6 p-3 rounded-full bg-red-500/20 transition-transform duration-200"
      style={{
        transform: `scale(${trashScale})`,
      }}
    >
      <Trash2 className="h-6 w-6 text-red-500" />
    </div>
  );
};

export default TrashIcon;
