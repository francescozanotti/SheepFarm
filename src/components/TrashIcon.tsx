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

      const maxDistance = 150;
      const scale = distance < maxDistance ? Math.max(1, 1.5 - distance / maxDistance) : 1;
      setTrashScale(scale);
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
