
import React, { useEffect, useRef } from 'react';
import { Text, Animated } from 'react-native';
import type { TextStyle } from 'react-native';

export function AnimatedCounter({ value, style }: { value: number, style?: TextStyle }) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: value,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [value]);

  const animatedText = animatedValue.interpolate({
    inputRange: [0, value],
    outputRange: ['0', value.toString()],
  });

  return (
    <Animated.Text style={style}>
      {animatedText}
    </Animated.Text>
  );
}
