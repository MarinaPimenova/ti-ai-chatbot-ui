// global.d.ts

/// <reference types="vite/client" />
/// <reference types="vitest/globals" />

import '@testing-library/jest-dom';
import {cleanup} from '@testing-library/react';

const {getComputedStyle} = window;
window.getComputedStyle = (elt) => getComputedStyle(elt);

vi.mock('zustand'); // to make it works like Jest (auto-mocking)

// Mock value of document.cookie ORIGINAL for testing API calls
Object.defineProperty(window.document, 'cookie', {
    writable: true,
    value: 'ORIGINAL=http://example.com',
});

// Mock the ResizeObserver
const ResizeObserverMock = vi.fn(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

// Mock scrollTo
const scrollToMock = vi.fn(() => {
});

// Stub the global ResizeObserver
vi.stubGlobal('ResizeObserver', ResizeObserverMock);

// Stub the global scrollTop
vi.stubGlobal('scrollTo', scrollToMock);

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
})

// Object.defineProperty(window, 'location', {
//   value: {
//     hash: {
//       endsWith: vi.fn(),
//       includes: vi.fn(),
//     },
//     assign: vi.fn(),
//   },
//   writable: true,
// });

afterEach(() => {
    cleanup();
});