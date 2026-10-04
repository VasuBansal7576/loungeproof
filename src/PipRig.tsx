import { useId } from "react";
/** Each visible joint is animated independently in the app and rendered tour. */
export function PipRig() {
  const id = useId().replaceAll(":", "");
  return (
    <svg className="pip-rig" viewBox="0 0 480 480" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-shell`} x1="0" x2="1" y1="0" y2="1">
          <stop stopColor="#7095ff" />
          <stop offset=".45" stopColor="#3452ff" />
          <stop offset="1" stopColor="#1b2aac" />
        </linearGradient>
        <linearGradient id={`${id}-edge`} x1="0" x2="1">
          <stop stopColor="#7ac8ff" />
          <stop offset="1" stopColor="#385eea" />
        </linearGradient>
        <linearGradient id={`${id}-visor`} x1="0" x2="0" y1="0" y2="1">
          <stop stopColor="#293057" />
          <stop offset="1" stopColor="#080c20" />
        </linearGradient>
        <linearGradient id={`${id}-paper`} x1="0" x2="1" y1="0" y2="1">
          <stop stopColor="#ffffff" />
          <stop offset="1" stopColor="#bfcaff" />
        </linearGradient>
      </defs>
      <ellipse
        className="rig-shadow"
        cx="246"
        cy="421"
        rx="111"
        ry="15"
        fill="#020613"
        opacity=".22"
      />
      <g className="rig-all">
        <g className="rig-feet">
          <g className="rig-foot-left">
            <path
              d="M170 361 205 360 209 401Q206 419 164 417Q143 414 150 399Z"
              fill={`url(#${id}-shell)`}
              stroke="#172d9d"
              strokeWidth="3"
            />
            <path
              d="M155 406Q174 411 203 405"
              fill="none"
              stroke="#7d9dff"
              strokeWidth="4"
            />
          </g>
          <g className="rig-foot-right">
            <path
              d="M273 360 309 357 331 399Q338 417 304 420Q277 422 273 403Z"
              fill={`url(#${id}-shell)`}
              stroke="#172d9d"
              strokeWidth="3"
            />
            <path
              d="M282 408Q303 414 324 406"
              fill="none"
              stroke="#7d9dff"
              strokeWidth="4"
            />
          </g>
        </g>
        <g className="rig-torso">
          <g className="rig-arm-left">
            <path
              d="M155 239Q122 229 102 204"
              fill="none"
              stroke="#3048ce"
              strokeWidth="20"
              strokeLinecap="round"
            />
            <path
              d="m113 211-62-48 20 71 42-8 13-20Z"
              fill={`url(#${id}-paper)`}
              stroke="#a5b9ef"
              strokeWidth="2"
            />
            <path d="m51 163 54 62-34 9" fill="#3452ff" />
            <path d="m51 163 62 48-8 14Z" fill="#f3f5fa" />
          </g>
          <g className="rig-arm-right">
            <path
              d="M318 240Q351 253 367 279"
              fill="none"
              stroke="#3048ce"
              strokeWidth="20"
              strokeLinecap="round"
            />
            <path
              d="m355 267 73 51-59-2-23-35Z"
              fill={`url(#${id}-paper)`}
              stroke="#a5b9ef"
              strokeWidth="2"
            />
            <path d="m355 267 73 51-61-18Z" fill="#f3f5fa" />
            <path d="m367 300 61 18-59-2Z" fill="#3452ff" />
          </g>
          <path
            d="M164 77 328 92Q349 95 346 121L323 346Q320 371 296 376L143 360Z"
            fill="#182bac"
            stroke="#1d2ea9"
            strokeWidth="4"
          />
          <path
            d="M159 77Q140 76 137 98L131 128Q153 137 145 157Q141 169 127 168L112 299Q131 311 124 330Q118 344 115 344L115 350Q114 366 135 369L289 389Q310 392 313 371L323 336Q301 326 308 306Q312 295 327 294L344 164Q324 153 331 134Q336 121 347 119L351 109Q354 91 333 88Z"
            fill={`url(#${id}-shell)`}
            stroke="#8da8ff"
            strokeWidth="3"
          />
          <path
            d="m283 83 31 4-29 297-30-4Z"
            fill={`url(#${id}-edge)`}
            opacity=".85"
          />
          <path
            d="m299 110-21 244"
            fill="none"
            stroke="#c0e4ff"
            strokeWidth="5"
            strokeDasharray="11 15"
            strokeLinecap="round"
          />
          <path
            d="m154 93 116 14"
            fill="none"
            stroke="#acbdff"
            strokeWidth="4"
            strokeLinecap="round"
            opacity=".65"
          />
          <path
            d="m142 330 92 11"
            fill="none"
            stroke="#0c268f"
            strokeWidth="3"
            strokeLinecap="round"
            opacity=".3"
          />
          <g className="rig-head">
            <path
              d="M166 150Q133 162 135 207Q137 246 179 255L250 264Q278 260 281 218Q287 171 251 160Z"
              fill={`url(#${id}-visor)`}
              stroke="#172044"
              strokeWidth="5"
            />
            <path
              d="M150 181Q169 158 197 168"
              fill="none"
              stroke="#6b78ae"
              strokeWidth="5"
              strokeLinecap="round"
              opacity=".6"
            />
            <g className="rig-look">
              <g className="rig-eyes">
                <path
                  d="M171 201Q177 176 187 185Q199 194 189 218Q183 211 174 219Q170 211 171 201Z"
                  fill="#f8f36b"
                />
                <path
                  d="M224 209Q232 184 243 194Q253 204 243 226Q236 217 227 227Q222 219 224 209Z"
                  fill="#f8f36b"
                />
              </g>
              <g
                className="rig-brows"
                fill="none"
                stroke="#f8f36b"
                strokeWidth="4"
                strokeLinecap="round"
              >
                <path d="m169 181 16-4" />
                <path d="m229 186 15 7" />
              </g>
              <g className="rig-mouth">
                <ellipse cx="209" cy="240" rx="11" ry="8" fill="#f8f36b" />
                <ellipse cx="209" cy="236" rx="6" ry="2" fill="#ffffc6" />
              </g>
            </g>
          </g>
          <path
            d="m149 280 74 9"
            stroke="#bdcdff"
            strokeWidth="3"
            opacity=".45"
          />
          <path
            d="m148 289 50 6"
            stroke="#bdcdff"
            strokeWidth="2"
            opacity=".45"
          />
          <rect
            x="244"
            y="296"
            width="19"
            height="30"
            rx="3"
            fill="#a9c7ff"
            opacity=".7"
            transform="rotate(7 244 296)"
          />
          <path
            d="m248 303 11 1m-12 5 11 1m-12 5 11 1"
            stroke="#2441bb"
            strokeWidth="2"
          />
        </g>
      </g>
    </svg>
  );
}
