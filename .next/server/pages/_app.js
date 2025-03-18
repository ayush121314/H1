/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "pages/_app";
exports.ids = ["pages/_app"];
exports.modules = {

/***/ "./src/components/ErrorBoundary.tsx":
/*!******************************************!*\
  !*** ./src/components/ErrorBoundary.tsx ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n\n\nclass ErrorBoundary extends react__WEBPACK_IMPORTED_MODULE_1__.Component {\n    constructor(props){\n        super(props);\n        this.state = {\n            hasError: false,\n            error: null\n        };\n    }\n    static getDerivedStateFromError(error) {\n        // Update state so the next render will show the fallback UI.\n        return {\n            hasError: true,\n            error\n        };\n    }\n    componentDidCatch(error, errorInfo) {\n        // You can also log the error to an error reporting service\n        console.error(\"Error caught by ErrorBoundary:\", error, errorInfo);\n    }\n    render() {\n        if (this.state.hasError) {\n            // You can render any custom fallback UI\n            if (this.props.fallback) {\n                return this.props.fallback;\n            }\n            return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                className: \"p-6 bg-red-50 border border-red-200 rounded-lg\",\n                children: [\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"h2\", {\n                        className: \"text-xl font-bold text-red-800 mb-2\",\n                        children: \"Something went wrong\"\n                    }, void 0, false, {\n                        fileName: \"/Users/ayushsinghchauhan/Downloads/dont_delete/cd3/src/components/ErrorBoundary.tsx\",\n                        lineNumber: 41,\n                        columnNumber: 11\n                    }, this),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"p\", {\n                        className: \"text-red-600 mb-4\",\n                        children: this.state.error?.message || \"An unexpected error occurred\"\n                    }, void 0, false, {\n                        fileName: \"/Users/ayushsinghchauhan/Downloads/dont_delete/cd3/src/components/ErrorBoundary.tsx\",\n                        lineNumber: 42,\n                        columnNumber: 11\n                    }, this),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"button\", {\n                        onClick: ()=>this.setState({\n                                hasError: false,\n                                error: null\n                            }),\n                        className: \"px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700\",\n                        children: \"Try again\"\n                    }, void 0, false, {\n                        fileName: \"/Users/ayushsinghchauhan/Downloads/dont_delete/cd3/src/components/ErrorBoundary.tsx\",\n                        lineNumber: 45,\n                        columnNumber: 11\n                    }, this)\n                ]\n            }, void 0, true, {\n                fileName: \"/Users/ayushsinghchauhan/Downloads/dont_delete/cd3/src/components/ErrorBoundary.tsx\",\n                lineNumber: 40,\n                columnNumber: 9\n            }, this);\n        }\n        return this.props.children;\n    }\n}\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ErrorBoundary);\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvY29tcG9uZW50cy9FcnJvckJvdW5kYXJ5LnRzeCIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBK0Q7QUFZL0QsTUFBTUUsc0JBQXNCRCw0Q0FBU0E7SUFDbkNFLFlBQVlDLEtBQVksQ0FBRTtRQUN4QixLQUFLLENBQUNBO1FBQ04sSUFBSSxDQUFDQyxLQUFLLEdBQUc7WUFDWEMsVUFBVTtZQUNWQyxPQUFPO1FBQ1Q7SUFDRjtJQUVBLE9BQU9DLHlCQUF5QkQsS0FBWSxFQUFTO1FBQ25ELDZEQUE2RDtRQUM3RCxPQUFPO1lBQUVELFVBQVU7WUFBTUM7UUFBTTtJQUNqQztJQUVBRSxrQkFBa0JGLEtBQVksRUFBRUcsU0FBb0IsRUFBUTtRQUMxRCwyREFBMkQ7UUFDM0RDLFFBQVFKLEtBQUssQ0FBQyxrQ0FBa0NBLE9BQU9HO0lBQ3pEO0lBRUFFLFNBQW9CO1FBQ2xCLElBQUksSUFBSSxDQUFDUCxLQUFLLENBQUNDLFFBQVEsRUFBRTtZQUN2Qix3Q0FBd0M7WUFDeEMsSUFBSSxJQUFJLENBQUNGLEtBQUssQ0FBQ1MsUUFBUSxFQUFFO2dCQUN2QixPQUFPLElBQUksQ0FBQ1QsS0FBSyxDQUFDUyxRQUFRO1lBQzVCO1lBRUEscUJBQ0UsOERBQUNDO2dCQUFJQyxXQUFVOztrQ0FDYiw4REFBQ0M7d0JBQUdELFdBQVU7a0NBQXNDOzs7Ozs7a0NBQ3BELDhEQUFDRTt3QkFBRUYsV0FBVTtrQ0FDVixJQUFJLENBQUNWLEtBQUssQ0FBQ0UsS0FBSyxFQUFFVyxXQUFXOzs7Ozs7a0NBRWhDLDhEQUFDQzt3QkFDQ0MsU0FBUyxJQUFNLElBQUksQ0FBQ0MsUUFBUSxDQUFDO2dDQUFFZixVQUFVO2dDQUFPQyxPQUFPOzRCQUFLO3dCQUM1RFEsV0FBVTtrQ0FDWDs7Ozs7Ozs7Ozs7O1FBS1A7UUFFQSxPQUFPLElBQUksQ0FBQ1gsS0FBSyxDQUFDa0IsUUFBUTtJQUM1QjtBQUNGO0FBRUEsaUVBQWVwQixhQUFhQSxFQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vY2hlc3MtZ2FtZWZpLy4vc3JjL2NvbXBvbmVudHMvRXJyb3JCb3VuZGFyeS50c3g/ZjYwYSJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QsIHsgQ29tcG9uZW50LCBFcnJvckluZm8sIFJlYWN0Tm9kZSB9IGZyb20gJ3JlYWN0JztcblxuaW50ZXJmYWNlIFByb3BzIHtcbiAgY2hpbGRyZW46IFJlYWN0Tm9kZTtcbiAgZmFsbGJhY2s/OiBSZWFjdE5vZGU7XG59XG5cbmludGVyZmFjZSBTdGF0ZSB7XG4gIGhhc0Vycm9yOiBib29sZWFuO1xuICBlcnJvcjogRXJyb3IgfCBudWxsO1xufVxuXG5jbGFzcyBFcnJvckJvdW5kYXJ5IGV4dGVuZHMgQ29tcG9uZW50PFByb3BzLCBTdGF0ZT4ge1xuICBjb25zdHJ1Y3Rvcihwcm9wczogUHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgdGhpcy5zdGF0ZSA9IHsgXG4gICAgICBoYXNFcnJvcjogZmFsc2UsXG4gICAgICBlcnJvcjogbnVsbFxuICAgIH07XG4gIH1cblxuICBzdGF0aWMgZ2V0RGVyaXZlZFN0YXRlRnJvbUVycm9yKGVycm9yOiBFcnJvcik6IFN0YXRlIHtcbiAgICAvLyBVcGRhdGUgc3RhdGUgc28gdGhlIG5leHQgcmVuZGVyIHdpbGwgc2hvdyB0aGUgZmFsbGJhY2sgVUkuXG4gICAgcmV0dXJuIHsgaGFzRXJyb3I6IHRydWUsIGVycm9yIH07XG4gIH1cblxuICBjb21wb25lbnREaWRDYXRjaChlcnJvcjogRXJyb3IsIGVycm9ySW5mbzogRXJyb3JJbmZvKTogdm9pZCB7XG4gICAgLy8gWW91IGNhbiBhbHNvIGxvZyB0aGUgZXJyb3IgdG8gYW4gZXJyb3IgcmVwb3J0aW5nIHNlcnZpY2VcbiAgICBjb25zb2xlLmVycm9yKFwiRXJyb3IgY2F1Z2h0IGJ5IEVycm9yQm91bmRhcnk6XCIsIGVycm9yLCBlcnJvckluZm8pO1xuICB9XG5cbiAgcmVuZGVyKCk6IFJlYWN0Tm9kZSB7XG4gICAgaWYgKHRoaXMuc3RhdGUuaGFzRXJyb3IpIHtcbiAgICAgIC8vIFlvdSBjYW4gcmVuZGVyIGFueSBjdXN0b20gZmFsbGJhY2sgVUlcbiAgICAgIGlmICh0aGlzLnByb3BzLmZhbGxiYWNrKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByb3BzLmZhbGxiYWNrO1xuICAgICAgfVxuICAgICAgXG4gICAgICByZXR1cm4gKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInAtNiBiZy1yZWQtNTAgYm9yZGVyIGJvcmRlci1yZWQtMjAwIHJvdW5kZWQtbGdcIj5cbiAgICAgICAgICA8aDIgY2xhc3NOYW1lPVwidGV4dC14bCBmb250LWJvbGQgdGV4dC1yZWQtODAwIG1iLTJcIj5Tb21ldGhpbmcgd2VudCB3cm9uZzwvaDI+XG4gICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1yZWQtNjAwIG1iLTRcIj5cbiAgICAgICAgICAgIHt0aGlzLnN0YXRlLmVycm9yPy5tZXNzYWdlIHx8IFwiQW4gdW5leHBlY3RlZCBlcnJvciBvY2N1cnJlZFwifVxuICAgICAgICAgIDwvcD5cbiAgICAgICAgICA8YnV0dG9uIFxuICAgICAgICAgICAgb25DbGljaz17KCkgPT4gdGhpcy5zZXRTdGF0ZSh7IGhhc0Vycm9yOiBmYWxzZSwgZXJyb3I6IG51bGwgfSl9XG4gICAgICAgICAgICBjbGFzc05hbWU9XCJweC00IHB5LTIgYmctcmVkLTYwMCB0ZXh0LXdoaXRlIHJvdW5kZWQgaG92ZXI6YmctcmVkLTcwMFwiXG4gICAgICAgICAgPlxuICAgICAgICAgICAgVHJ5IGFnYWluXG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5wcm9wcy5jaGlsZHJlbjtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBFcnJvckJvdW5kYXJ5OyAiXSwibmFtZXMiOlsiUmVhY3QiLCJDb21wb25lbnQiLCJFcnJvckJvdW5kYXJ5IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsInN0YXRlIiwiaGFzRXJyb3IiLCJlcnJvciIsImdldERlcml2ZWRTdGF0ZUZyb21FcnJvciIsImNvbXBvbmVudERpZENhdGNoIiwiZXJyb3JJbmZvIiwiY29uc29sZSIsInJlbmRlciIsImZhbGxiYWNrIiwiZGl2IiwiY2xhc3NOYW1lIiwiaDIiLCJwIiwibWVzc2FnZSIsImJ1dHRvbiIsIm9uQ2xpY2siLCJzZXRTdGF0ZSIsImNoaWxkcmVuIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./src/components/ErrorBoundary.tsx\n");

/***/ }),

/***/ "./src/pages/_app.tsx":
/*!****************************!*\
  !*** ./src/pages/_app.tsx ***!
  \****************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../styles/globals.css */ \"./src/styles/globals.css\");\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_styles_globals_css__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var ethers__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ethers */ \"ethers\");\n/* harmony import */ var _components_ErrorBoundary__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../components/ErrorBoundary */ \"./src/components/ErrorBoundary.tsx\");\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([ethers__WEBPACK_IMPORTED_MODULE_3__]);\nethers__WEBPACK_IMPORTED_MODULE_3__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];\n\n\n\n\n\n// Web3 wallet connection state context could be added here\nfunction MyApp({ Component, pageProps }) {\n    const [provider, setProvider] = (0,react__WEBPACK_IMPORTED_MODULE_2__.useState)(null);\n    // Initialize ethers provider when the app loads\n    (0,react__WEBPACK_IMPORTED_MODULE_2__.useEffect)(()=>{\n        if (false) {}\n    }, []);\n    // We don't need to connect a wallet here anymore - we'll handle that in the index page\n    // for each player separately\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_components_ErrorBoundary__WEBPACK_IMPORTED_MODULE_4__[\"default\"], {\n        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n            className: \"min-h-screen bg-background\",\n            children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(Component, {\n                ...pageProps,\n                provider: provider\n            }, void 0, false, {\n                fileName: \"/Users/ayushsinghchauhan/Downloads/dont_delete/cd3/src/pages/_app.tsx\",\n                lineNumber: 36,\n                columnNumber: 9\n            }, this)\n        }, void 0, false, {\n            fileName: \"/Users/ayushsinghchauhan/Downloads/dont_delete/cd3/src/pages/_app.tsx\",\n            lineNumber: 35,\n            columnNumber: 7\n        }, this)\n    }, void 0, false, {\n        fileName: \"/Users/ayushsinghchauhan/Downloads/dont_delete/cd3/src/pages/_app.tsx\",\n        lineNumber: 34,\n        columnNumber: 5\n    }, this);\n}\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (MyApp);\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvcGFnZXMvX2FwcC50c3giLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztBQUErQjtBQUVhO0FBQ1o7QUFDd0I7QUFReEQsMkRBQTJEO0FBRTNELFNBQVNJLE1BQU0sRUFBRUMsU0FBUyxFQUFFQyxTQUFTLEVBQVk7SUFDL0MsTUFBTSxDQUFDQyxVQUFVQyxZQUFZLEdBQUdSLCtDQUFRQSxDQUFNO0lBRTlDLGdEQUFnRDtJQUNoREMsZ0RBQVNBLENBQUM7UUFDUixJQUFJLEtBQWdELEVBQUUsRUFPckQ7SUFDSCxHQUFHLEVBQUU7SUFFTCx1RkFBdUY7SUFDdkYsNkJBQTZCO0lBRTdCLHFCQUNFLDhEQUFDRSxpRUFBYUE7a0JBQ1osNEVBQUNXO1lBQUlDLFdBQVU7c0JBQ2IsNEVBQUNWO2dCQUNFLEdBQUdDLFNBQVM7Z0JBQ2JDLFVBQVVBOzs7Ozs7Ozs7Ozs7Ozs7O0FBS3BCO0FBRUEsaUVBQWVILEtBQUtBLEVBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9jaGVzcy1nYW1lZmkvLi9zcmMvcGFnZXMvX2FwcC50c3g/ZjlkNiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgJy4uL3N0eWxlcy9nbG9iYWxzLmNzcyc7XG5pbXBvcnQgdHlwZSB7IEFwcFByb3BzIH0gZnJvbSAnbmV4dC9hcHAnO1xuaW1wb3J0IHsgdXNlU3RhdGUsIHVzZUVmZmVjdCB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IGV0aGVycyB9IGZyb20gJ2V0aGVycyc7XG5pbXBvcnQgRXJyb3JCb3VuZGFyeSBmcm9tICcuLi9jb21wb25lbnRzL0Vycm9yQm91bmRhcnknO1xuXG5kZWNsYXJlIGdsb2JhbCB7XG4gIGludGVyZmFjZSBXaW5kb3cge1xuICAgIGV0aGVyZXVtOiBhbnk7XG4gIH1cbn1cblxuLy8gV2ViMyB3YWxsZXQgY29ubmVjdGlvbiBzdGF0ZSBjb250ZXh0IGNvdWxkIGJlIGFkZGVkIGhlcmVcblxuZnVuY3Rpb24gTXlBcHAoeyBDb21wb25lbnQsIHBhZ2VQcm9wcyB9OiBBcHBQcm9wcykge1xuICBjb25zdCBbcHJvdmlkZXIsIHNldFByb3ZpZGVyXSA9IHVzZVN0YXRlPGFueT4obnVsbCk7XG5cbiAgLy8gSW5pdGlhbGl6ZSBldGhlcnMgcHJvdmlkZXIgd2hlbiB0aGUgYXBwIGxvYWRzXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5ldGhlcmV1bSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcHJvdmlkZXIgPSBuZXcgZXRoZXJzLkJyb3dzZXJQcm92aWRlcih3aW5kb3cuZXRoZXJldW0pO1xuICAgICAgICBzZXRQcm92aWRlcihwcm92aWRlcik7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKFwiRXJyb3IgaW5pdGlhbGl6aW5nIHByb3ZpZGVyOlwiLCBlcnJvcik7XG4gICAgICB9XG4gICAgfVxuICB9LCBbXSk7XG5cbiAgLy8gV2UgZG9uJ3QgbmVlZCB0byBjb25uZWN0IGEgd2FsbGV0IGhlcmUgYW55bW9yZSAtIHdlJ2xsIGhhbmRsZSB0aGF0IGluIHRoZSBpbmRleCBwYWdlXG4gIC8vIGZvciBlYWNoIHBsYXllciBzZXBhcmF0ZWx5XG5cbiAgcmV0dXJuIChcbiAgICA8RXJyb3JCb3VuZGFyeT5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwibWluLWgtc2NyZWVuIGJnLWJhY2tncm91bmRcIj5cbiAgICAgICAgPENvbXBvbmVudCBcbiAgICAgICAgICB7Li4ucGFnZVByb3BzfSBcbiAgICAgICAgICBwcm92aWRlcj17cHJvdmlkZXJ9XG4gICAgICAgIC8+XG4gICAgICA8L2Rpdj5cbiAgICA8L0Vycm9yQm91bmRhcnk+XG4gICk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IE15QXBwOyAiXSwibmFtZXMiOlsidXNlU3RhdGUiLCJ1c2VFZmZlY3QiLCJldGhlcnMiLCJFcnJvckJvdW5kYXJ5IiwiTXlBcHAiLCJDb21wb25lbnQiLCJwYWdlUHJvcHMiLCJwcm92aWRlciIsInNldFByb3ZpZGVyIiwid2luZG93IiwiZXRoZXJldW0iLCJCcm93c2VyUHJvdmlkZXIiLCJlcnJvciIsImNvbnNvbGUiLCJkaXYiLCJjbGFzc05hbWUiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./src/pages/_app.tsx\n");

/***/ }),

/***/ "./src/styles/globals.css":
/*!********************************!*\
  !*** ./src/styles/globals.css ***!
  \********************************/
/***/ (() => {



/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "react" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("react");

/***/ }),

/***/ "react/jsx-dev-runtime":
/*!****************************************!*\
  !*** external "react/jsx-dev-runtime" ***!
  \****************************************/
/***/ ((module) => {

"use strict";
module.exports = require("react/jsx-dev-runtime");

/***/ }),

/***/ "ethers":
/*!*************************!*\
  !*** external "ethers" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = import("ethers");;

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = (__webpack_exec__("./src/pages/_app.tsx"));
module.exports = __webpack_exports__;

})();