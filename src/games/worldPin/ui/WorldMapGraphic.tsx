"use client";

import React from "react";

/**
 * Componente gráfico vetorial detalhado do Mapa-Múndi para o jogo Pin do Mundo.
 * Inclui contornos geográficos fiéis dos continentes, oceanos estilizados com gradientes,
 * linhas de coordenadas (Equador, Trópicos, Meridianos) e filtros de brilho (glow).
 */

export function WorldMapGraphic() {
  return (
    <>
      <defs>
        {/* Gradiente do Oceano */}
        <radialGradient id="ocean-grad" cx="50%" cy="50%" r="75%">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="60%" stopColor="#090d16" />
          <stop offset="100%" stopColor="#04070d" />
        </radialGradient>

        {/* Gradiente das Massas Terrestres */}
        <linearGradient id="land-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
          <stop offset="50%" stopColor="#059669" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#047857" stopOpacity="0.35" />
        </linearGradient>

        {/* Efeito de Brilho nas Costas (Coastline Glow) */}
        <filter id="land-glow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#10b981" floodOpacity="0.6" />
        </filter>
      </defs>

      {/* Fundo Oceanórico */}
      <rect width="360" height="180" fill="url(#ocean-grad)" />

      {/* Grade de Coordenadas (Meridianos & Paralelos) */}
      <g stroke="rgba(255, 255, 255, 0.05)" strokeWidth="0.4">
        {[30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((x) => (
          <line key={`meridian-${x}`} x1={x} y1={0} x2={x} y2={180} />
        ))}
        {[20, 40, 60, 80, 100, 120, 140, 160].map((y) => (
          <line key={`parallel-${y}`} x1={0} y1={y} x2={360} y2={y} />
        ))}
      </g>

      {/* Trópicos e Equador */}
      <g strokeWidth="0.6" strokeDasharray="3 3">
        {/* Trópico de Câncer (+23.5°) -> y = 66.5 */}
        <line x1={0} y1={66.5} x2={360} y2={66.5} stroke="rgba(234, 179, 8, 0.25)" />
        {/* Equador (0°) -> y = 90 */}
        <line x1={0} y1={90} x2={360} y2={90} stroke="rgba(16, 185, 129, 0.5)" strokeWidth="0.8" />
        {/* Trópico de Capricórnio (-23.5°) -> y = 113.5 */}
        <line x1={0} y1={113.5} x2={360} y2={113.5} stroke="rgba(234, 179, 8, 0.25)" />
      </g>

      {/* Rótulo do Equador */}
      <text x="6" y="88" fill="rgba(16, 185, 129, 0.7)" fontSize="4" fontStyle="italic" fontWeight="bold">0° EQUADOR</text>
      <text x="6" y="65" fill="rgba(234, 179, 8, 0.5)" fontSize="3.5" fontStyle="italic">23.5° N</text>
      <text x="6" y="112" fill="rgba(234, 179, 8, 0.5)" fontSize="3.5" fontStyle="italic">23.5° S</text>

      {/* CONTINENTES E ILHAS (VETORES DETALHADOS REFINADOS) */}
      <g fill="url(#land-grad)" stroke="#10b981" strokeWidth="0.4" strokeLinejoin="round" strokeLinecap="round" filter="url(#land-glow)">
        
        {/* América do Norte */}
        <path d="M 15 20 
                 L 35 15 L 55 18 L 75 14 L 90 22 L 105 18 L 125 25 L 140 20 L 148 30 
                 L 135 45 L 120 48 L 105 52 L 100 65 L 90 75 L 85 85 L 88 95 L 82 105 
                 L 75 100 L 72 90 L 68 85 L 60 78 L 52 75 L 45 68 L 30 65 L 20 55 
                 L 10 40 L 12 30 Z" />

        {/* Groenlândia */}
        <path d="M 125 10 L 155 8 L 165 22 L 145 30 L 130 25 Z" />

        {/* América do Sul */}
        <path d="M 98 102 
                 L 115 100 L 135 110 L 145 120 L 142 135 L 132 152 L 122 165 L 115 172 
                 L 110 160 L 105 148 L 100 135 L 95 120 L 92 110 Z" />

        {/* Europa */}
        <path d="M 170 30 
                 L 185 22 L 205 20 L 220 25 L 235 32 L 225 45 L 210 52 L 195 55 
                 L 182 50 L 175 42 L 168 38 Z" />

        {/* Reino Unido & Irlanda */}
        <path d="M 165 32 L 172 28 L 175 35 L 168 38 Z" />

        {/* África */}
        <path d="M 168 62 
                 L 185 58 L 205 58 L 220 65 L 232 78 L 235 95 L 225 115 L 212 135 
                 L 198 145 L 188 135 L 178 120 L 165 105 L 158 90 L 160 75 Z" />

        {/* Madagascar */}
        <path d="M 235 120 L 242 118 L 238 135 L 232 132 Z" />

        {/* Ásia */}
        <path d="M 222 24 
                 L 255 15 L 290 18 L 325 22 L 345 30 L 355 45 L 340 60 L 320 68 
                 L 305 78 L 290 85 L 275 80 L 265 92 L 255 90 L 245 78 L 238 65 
                 L 230 50 L 222 38 Z" />

        {/* Índia */}
        <path d="M 252 75 L 268 76 L 262 95 L 254 92 Z" />

        {/* Japão */}
        <path d="M 328 42 L 336 40 L 342 52 L 334 56 Z" />

        {/* Sudeste Asiático / Indonésia / Filipinas */}
        <path d="M 285 92 L 305 90 L 325 96 L 315 108 L 295 105 Z" />
        <path d="M 318 85 L 324 82 L 322 92 Z" />

        {/* Austrália & Oceania */}
        <path d="M 298 122 
                 L 325 118 L 342 125 L 348 142 L 335 158 L 312 155 L 295 142 L 292 130 Z" />

        {/* Nova Zelândia */}
        <path d="M 348 152 L 354 148 L 358 162 Z" />
      </g>

      {/* Rosa dos Ventos Integrada (Bússola no Canto Superior Direito) */}
      <g transform="translate(342, 18)" opacity="0.6">
        <circle r="12" fill="none" stroke="rgba(16, 185, 129, 0.4)" strokeWidth="0.5" />
        <polygon points="0,-10 3,-3 0,0 -3,-3" fill="#10b981" />
        <polygon points="0,10 3,3 0,0 -3,3" fill="rgba(255,255,255,0.4)" />
        <polygon points="10,0 3,3 0,0 3,-3" fill="rgba(255,255,255,0.4)" />
        <polygon points="-10,0 -3,3 0,0 -3,-3" fill="rgba(255,255,255,0.4)" />
        <text x="0" y="-12" textAnchor="middle" fill="#10b981" fontSize="4.5" fontWeight="black">N</text>
      </g>
    </>
  );
}
