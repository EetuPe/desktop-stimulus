import { useState, useEffect, useCallback } from "react";
import gooseImage from "./assets/goose.png";

const DesktopGoose = () => {
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [isWalking, setIsWalking] = useState(false);
  const [direction, setDirection] = useState(1); // 1 for right, -1 for left
  const [targetPosition, setTargetPosition] = useState({ x: 100, y: 100 });
  const [scale, setScale] = useState(1); // Add this new state
  const [isFollowingCursor, setIsFollowingCursor] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Define size constant at the top of component
  const GOOSE_SIZE = 96; // increased from 64

  useEffect(() => {
    const moveTowardsTarget = () => {
      if (!isWalking) return;

      const dx = targetPosition.x - position.x;
      const dy = targetPosition.y - position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 5) {
        setIsWalking(false);
        return;
      }

      // Varied speed based on distance
      const speed = Math.min(7, Math.max(3, distance / 10));

      setPosition((p) => ({
        x: Math.max(
          0,
          Math.min(
            window.innerWidth - GOOSE_SIZE,
            p.x + (dx / distance) * speed
          )
        ),
        y: Math.max(
          0,
          Math.min(
            window.innerHeight - GOOSE_SIZE,
            p.y + (dy / distance) * speed
          )
        ),
      }));
    };

    const walkTimer = setInterval(moveTowardsTarget, 16);

    // Random movement behavior
    const decideNextMove = () => {
      if (!isWalking) {
        // 70% chance to start walking when idle
        if (Math.random() < 0.7) {
          const distance = 100 + Math.random() * 300; // Longer distances
          const angle = Math.random() * Math.PI * 2;
          const targetX = position.x + Math.cos(angle) * distance;
          const targetY = position.y + Math.sin(angle) * distance;

          // Keep within bounds
          setTargetPosition({
            x: Math.max(
              GOOSE_SIZE,
              Math.min(window.innerWidth - GOOSE_SIZE, targetX)
            ),
            y: Math.max(
              GOOSE_SIZE,
              Math.min(window.innerHeight - GOOSE_SIZE, targetY)
            ),
          });
          setDirection(targetX > position.x ? 1 : -1);
          setIsWalking(true);
        }
      }
    };

    // Random intervals between decisions
    const decisionTimer = setInterval(
      decideNextMove,
      500 + Math.random() * 1000
    );

    // Handle window resize
    const handleResize = () => {
      setPosition((p) => ({
        x: Math.min(p.x, window.innerWidth - GOOSE_SIZE),
        y: Math.min(p.y, window.innerHeight - GOOSE_SIZE),
      }));
    };

    window.addEventListener("resize", handleResize);

    return () => {
      clearInterval(walkTimer);
      clearInterval(decisionTimer);
      window.removeEventListener("resize", handleResize);
    };
  }, [isWalking, position.x, position.y, targetPosition, isFollowingCursor]);

  // Effect for size animation
  useEffect(() => {
    const triggerSizeChange = () => {
      if (Math.random() < 0.3) {
        setScale(0.9);
        setTimeout(() => setScale(1.2), 200);
        setTimeout(() => setScale(1), 3000);
      }
    };

    const sizeTimer = setInterval(
      triggerSizeChange,
      12000 + Math.random() * 5000
    );

    return () => clearInterval(sizeTimer);
  }, []);

  // Add cursor following effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isFollowingCursor) {
        setTargetPosition({ x: e.clientX, y: e.clientY });
        setIsWalking(true);
      }
    };

    const startFollowing = () => {
      if (Math.random() < 0.3) {
        // 30% chance to start following
        setIsFollowingCursor(true);
        setIsWalking(true);

        // Stop following after 10 seconds
        setTimeout(() => {
          setIsFollowingCursor(false);
        }, 10000);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    const followTimer = setInterval(
      startFollowing,
      15000 + Math.random() * 10000
    );

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearInterval(followTimer);
    };
  }, [isFollowingCursor]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setIsWalking(false);
    setIsFollowingCursor(false);

    // Calculate offset between mouse and goose position
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: Math.max(
            0,
            Math.min(window.innerWidth - GOOSE_SIZE, e.clientX - dragOffset.x)
          ),
          y: Math.max(
            0,
            Math.min(window.innerHeight - GOOSE_SIZE, e.clientY - dragOffset.y)
          ),
        });
      }
    },
    [isDragging, dragOffset, GOOSE_SIZE]
  );

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove]);

  return (
    <div
      className="fixed z-50 select-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: `scaleX(${direction > 0 ? 1 : -1})`,
        cursor: isDragging ? "grabbing" : "grab",
      }}
      onMouseDown={handleMouseDown}
    >
      <div
        className={`${
          isWalking ? "animate-[bounce_0.3s_ease-in-out_infinite]" : ""
        } ${
          isDragging ? "animate-[wiggle_0.3s_ease-in-out_infinite]" : ""
        } transition-transform duration-150`}
        style={{ transform: `scale(${scale})` }}
      >
        <img
          src={gooseImage}
          alt="Goose"
          width={GOOSE_SIZE}
          height={GOOSE_SIZE}
          className="drop-shadow-lg opacity-100"
          draggable="false"
        />
      </div>
    </div>
  );
};

export default DesktopGoose;
