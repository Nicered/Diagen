'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { dslToSvg } from 'diagen';
import { examples, ExampleKey } from '@/lib/examples';

type Theme = 'professional' | 'modern' | 'minimal';
type Direction = 'TB' | 'BT' | 'LR' | 'RL';

export default function DiagramEditor() {
  const [code, setCode] = useState(examples.simple.code);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState<Theme>('professional');
  const [direction, setDirection] = useState<Direction>('TB');
  const [showExamples, setShowExamples] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();

  const renderDiagram = useCallback(async (source: string) => {
    setIsLoading(true);
    setError('');

    try {
      const result = await dslToSvg(source, {
        theme,
        layout: { direction },
      });
      setSvg(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setSvg('');
    } finally {
      setIsLoading(false);
    }
  }, [theme, direction]);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      renderDiagram(code);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [code, renderDiagram]);

  const handleExport = () => {
    if (!svg) return;

    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'diagram.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const loadExample = (key: ExampleKey) => {
    setCode(examples[key].code);
    setShowExamples(false);
  };

  return (
    <div className="editor-container">
      <header className="header">
        <h1>
          <span>◇</span> Diagen Playground
        </h1>

        <div className="toolbar">
          <div className="toolbar-group">
            <label>테마:</label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as Theme)}
            >
              <option value="professional">Professional</option>
              <option value="modern">Modern</option>
              <option value="minimal">Minimal</option>
            </select>
          </div>

          <div className="toolbar-group">
            <label>방향:</label>
            <select
              value={direction}
              onChange={(e) => setDirection(e.target.value as Direction)}
            >
              <option value="TB">위 → 아래</option>
              <option value="BT">아래 → 위</option>
              <option value="LR">좌 → 우</option>
              <option value="RL">우 → 좌</option>
            </select>
          </div>

          <div className="examples-dropdown">
            <button
              className="btn btn-secondary"
              onClick={() => setShowExamples(!showExamples)}
            >
              예제 ▾
            </button>
            {showExamples && (
              <div className="examples-menu">
                {Object.entries(examples).map(([key, example]) => (
                  <button key={key} onClick={() => loadExample(key as ExampleKey)}>
                    {example.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button className="btn btn-primary" onClick={handleExport} disabled={!svg}>
            SVG 내보내기
          </button>

          <a
            href="https://github.com/anthropics/diagen"
            target="_blank"
            rel="noopener noreferrer"
            className="github-link"
          >
            GitHub
          </a>
        </div>
      </header>

      <main className="main-content">
        <div className="editor-panel">
          <div className="panel-header">Editor</div>
          <textarea
            className="editor-textarea"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="@diagram을 입력하여 시작하세요..."
            spellCheck={false}
          />
        </div>

        <div className="preview-panel">
          <div className="panel-header">Preview</div>
          <div className="preview-content">
            {isLoading && <div className="loading">렌더링 중...</div>}
            {error && <div className="error-message">{error}</div>}
            {svg && !error && (
              <div dangerouslySetInnerHTML={{ __html: svg }} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
