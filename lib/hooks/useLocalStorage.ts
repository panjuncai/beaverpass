'use client';
import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * 使用localStorage进行持久化存储的Hook
 * @param key 存储的键
 * @param initialValue 初始值
 * @returns [存储的值, 设置值的函数, 移除值的函数]
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void, () => void] {
  // 获取存储值函数（在初始渲染时使用）
  const readValue = useCallback((): T => {
    // 在服务器端返回初始值
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      // 从localStorage获取值
      const item = window.localStorage.getItem(key);
      // 如果不存在则返回初始值
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [initialValue, key]);

  // 状态管理值
  const [storedValue, setStoredValue] = useState<T>(() => readValue());
  
  // 记录是否已初始化
  const isInitialized = useRef(false);

  // 在组件挂载或键变化时从localStorage读取值
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // 只在初始化时读取一次值，避免循环依赖
    if (!isInitialized.current) {
      isInitialized.current = true;
      const newValue = readValue();
      setStoredValue(newValue);
    }
  }, [readValue]);

  // 返回函数用于更新存储的值
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      if (typeof window === 'undefined') {
        console.warn(
          `Tried setting localStorage key "${key}" even though environment is not a browser`
        );
        return;
      }

      try {
        // 允许value是函数，以便与useState相同的API
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
          
        // 检查值是否确实发生变化，避免不必要的状态更新和localStorage操作
        if (JSON.stringify(valueToStore) === JSON.stringify(storedValue)) {
          return;
        }

        // 保存到state
        setStoredValue(valueToStore);

        // 保存到localStorage
        window.localStorage.setItem(key, JSON.stringify(valueToStore));

      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  // 移除localStorage中的值
  const removeValue = useCallback(() => {
    if (typeof window === 'undefined') {
      console.warn(
        `Tried removing localStorage key "${key}" even though environment is not a browser`
      );
      return;
    }

    try {
      // 从localStorage移除
      window.localStorage.removeItem(key);
      // 重置state为初始值
      setStoredValue(initialValue);
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [initialValue, key]);

  return [storedValue, setValue, removeValue];
}