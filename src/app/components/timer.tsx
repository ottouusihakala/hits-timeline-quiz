'use client'

import { add, Duration } from 'date-fns'
import { useEffect, useState } from 'react'

interface Properties {
  onTimeout: () => void | Promise<void>
  duration: Duration 
}

const Timer = ({ onTimeout, duration }: Properties) => {
  const [timerStarted, setTimerStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>();
  const [targetTime, setTargetTime] = useState<number>();

  useEffect(() => {
    if (timerStarted && (timeRemaining || 0) > 0) {
      const countdownInterval = setInterval(() => {
        let remainingTime = (targetTime || 0) - (new Date()).getTime();
  
        if (remainingTime <= 0) {
          remainingTime = 0;
        }
  
        setTimeRemaining(remainingTime);
      }, 1000);
  
      return () => clearInterval(countdownInterval);
    }
  }, [targetTime, timeRemaining, timerStarted]);

  useEffect(() => {
    if (!timerStarted) {
      const startDate = new Date();
      const targetDate = add(startDate, duration);
      setTargetTime(targetDate.getTime());
      setTimeRemaining(targetDate.getTime() - startDate.getTime());
      setTimerStarted(true);
    }
  }, [duration, timerStarted]);

  useEffect(() => {
    if (timeRemaining === 0) {
      onTimeout();
      setTimeRemaining(undefined);
    }
  }, [onTimeout, timeRemaining]);

  return (
    <div>{Math.floor((timeRemaining || 0) / 1000)}</div>
  );
}

export default Timer;