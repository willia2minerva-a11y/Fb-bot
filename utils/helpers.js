export function formatNumber(number) {
  return new Intl.NumberFormat('ar-EG').format(number);
}

export function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function calculateLevel(exp) {
  let level = 1;
  let expNeeded = 100;
  
  while (exp >= expNeeded) {
    level++;
    exp -= expNeeded;
    expNeeded = level * 100;
  }
  
  return {
    level,
    currentExp: exp,
    nextLevelExp: expNeeded,
    progress: Math.floor((exp / expNeeded) * 100)
  };
}

export function formatTime(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours} ساعة ${minutes % 60} دقيقة`;
  } else if (minutes > 0) {
    return `${minutes} دقيقة ${seconds % 60} ثانية`;
  } else {
    return `${seconds} ثانية`;
  }
}

export function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

export function chance(percentage) {
  return Math.random() * 100 < percentage;
                         }
