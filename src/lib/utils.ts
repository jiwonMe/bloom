import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Tailwind CSS 클래스명을 조건부로 결합하고 충돌을 해결하는 유틸리티 함수
 * clsx와 tailwind-merge를 조합하여 사용
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
