import DiagramGallery from "@/components/DiagramGallery";
import { cn } from "@/lib/utils";
// import EigenvectorsDiagram from "./eigen.js";

export const App = () => {
//   return <EigenvectorsDiagram />;
   return (
     <div 
       className={cn(
         // 기본 컨테이너 스타일
         "min-h-screen",
         "bg-gradient-to-br from-blue-50 to-indigo-100",
         // 패딩 및 마진
         "p-4",
         // 플렉스 레이아웃
         "flex flex-col",
       )}
     >
       {/* 헤더 영역 */}
       <header 
         className={cn(
           // 배경 및 테두리
           "bg-white/80 backdrop-blur-sm",
           "border border-white/20 rounded-lg",
           "shadow-lg shadow-blue-500/10",
           // 패딩 및 마진
           "p-6 mb-8",
           // 텍스트 정렬
           "text-center",
         )}
       >
         <h1 
           className={cn(
             // 텍스트 스타일
             "text-4xl font-bold",
             "text-gradient bg-gradient-to-r from-blue-600 to-purple-600",
             "bg-clip-text text-transparent",
             // 마진
             "mb-2",
           )}
         >
           Bloom Diagram Gallery
         </h1>
         <p 
           className={cn(
             // 텍스트 색상 및 크기
             "text-gray-600 text-lg",
             // 애니메이션
             "animate-fade-in",
           )}
         >
           Interactive mathematical diagrams powered by Penrose
         </p>
       </header>

       {/* 메인 콘텐츠 */}
       <main 
         className={cn(
           // 플렉스 성장
           "flex-1",
           // 애니메이션
           "animate-slide-up",
         )}
       >
         <DiagramGallery />
       </main>
     </div>
   );
};