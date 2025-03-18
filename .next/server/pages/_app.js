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
eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../styles/globals.css */ \"./src/styles/globals.css\");\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_styles_globals_css__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _components_ErrorBoundary__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../components/ErrorBoundary */ \"./src/components/ErrorBoundary.tsx\");\n/* harmony import */ var _aptos_labs_wallet_adapter_react__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @aptos-labs/wallet-adapter-react */ \"@aptos-labs/wallet-adapter-react\");\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_aptos_labs_wallet_adapter_react__WEBPACK_IMPORTED_MODULE_3__]);\n_aptos_labs_wallet_adapter_react__WEBPACK_IMPORTED_MODULE_3__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];\n\n\n\n\n// Web3 wallet connection state context could be added here\nfunction MyApp({ Component, pageProps }) {\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_components_ErrorBoundary__WEBPACK_IMPORTED_MODULE_2__[\"default\"], {\n        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_aptos_labs_wallet_adapter_react__WEBPACK_IMPORTED_MODULE_3__.AptosWalletAdapterProvider, {\n            autoConnect: true,\n            onError: (error)=>{\n                console.error(\"Wallet adapter error:\", error);\n            },\n            // Explicitly opt-in to Petra wallet\n            optInWallets: [\n                \"Petra\"\n            ],\n            children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                className: \"min-h-screen bg-background\",\n                children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(Component, {\n                    ...pageProps\n                }, void 0, false, {\n                    fileName: \"/Users/ayushsinghchauhan/Downloads/dont_delete/cd3/src/pages/_app.tsx\",\n                    lineNumber: 29,\n                    columnNumber: 11\n                }, this)\n            }, void 0, false, {\n                fileName: \"/Users/ayushsinghchauhan/Downloads/dont_delete/cd3/src/pages/_app.tsx\",\n                lineNumber: 28,\n                columnNumber: 9\n            }, this)\n        }, void 0, false, {\n            fileName: \"/Users/ayushsinghchauhan/Downloads/dont_delete/cd3/src/pages/_app.tsx\",\n            lineNumber: 20,\n            columnNumber: 7\n        }, this)\n    }, void 0, false, {\n        fileName: \"/Users/ayushsinghchauhan/Downloads/dont_delete/cd3/src/pages/_app.tsx\",\n        lineNumber: 19,\n        columnNumber: 5\n    }, this);\n}\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (MyApp);\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvcGFnZXMvX2FwcC50c3giLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBK0I7QUFHeUI7QUFDc0I7QUFVOUUsMkRBQTJEO0FBRTNELFNBQVNFLE1BQU0sRUFBRUMsU0FBUyxFQUFFQyxTQUFTLEVBQVk7SUFDL0MscUJBQ0UsOERBQUNKLGlFQUFhQTtrQkFDWiw0RUFBQ0Msd0ZBQTBCQTtZQUN6QkksYUFBYTtZQUNiQyxTQUFTLENBQUNDO2dCQUNSQyxRQUFRRCxLQUFLLENBQUMseUJBQXlCQTtZQUN6QztZQUNBLG9DQUFvQztZQUNwQ0UsY0FBYztnQkFBQzthQUFRO3NCQUV2Qiw0RUFBQ0M7Z0JBQUlDLFdBQVU7MEJBQ2IsNEVBQUNSO29CQUFXLEdBQUdDLFNBQVM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUtsQztBQUVBLGlFQUFlRixLQUFLQSxFQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vY2hlc3MtZ2FtZWZpLy4vc3JjL3BhZ2VzL19hcHAudHN4P2Y5ZDYiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICcuLi9zdHlsZXMvZ2xvYmFscy5jc3MnO1xuaW1wb3J0IHR5cGUgeyBBcHBQcm9wcyB9IGZyb20gJ25leHQvYXBwJztcbmltcG9ydCB7IHVzZVN0YXRlLCB1c2VFZmZlY3QgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgRXJyb3JCb3VuZGFyeSBmcm9tICcuLi9jb21wb25lbnRzL0Vycm9yQm91bmRhcnknO1xuaW1wb3J0IHsgQXB0b3NXYWxsZXRBZGFwdGVyUHJvdmlkZXIgfSBmcm9tICdAYXB0b3MtbGFicy93YWxsZXQtYWRhcHRlci1yZWFjdCc7XG5pbXBvcnQgeyBOZXR3b3JrIH0gZnJvbSAnYXB0b3MnO1xuXG4vLyBEZWZpbmUgdGhlIHdpbmRvdyB0eXBlIGZvciBBcHRvc1xuZGVjbGFyZSBnbG9iYWwge1xuICBpbnRlcmZhY2UgV2luZG93IHtcbiAgICBhcHRvczogYW55O1xuICB9XG59XG5cbi8vIFdlYjMgd2FsbGV0IGNvbm5lY3Rpb24gc3RhdGUgY29udGV4dCBjb3VsZCBiZSBhZGRlZCBoZXJlXG5cbmZ1bmN0aW9uIE15QXBwKHsgQ29tcG9uZW50LCBwYWdlUHJvcHMgfTogQXBwUHJvcHMpIHtcbiAgcmV0dXJuIChcbiAgICA8RXJyb3JCb3VuZGFyeT5cbiAgICAgIDxBcHRvc1dhbGxldEFkYXB0ZXJQcm92aWRlclxuICAgICAgICBhdXRvQ29ubmVjdD17dHJ1ZX1cbiAgICAgICAgb25FcnJvcj17KGVycm9yKSA9PiB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihcIldhbGxldCBhZGFwdGVyIGVycm9yOlwiLCBlcnJvcik7XG4gICAgICAgIH19XG4gICAgICAgIC8vIEV4cGxpY2l0bHkgb3B0LWluIHRvIFBldHJhIHdhbGxldFxuICAgICAgICBvcHRJbldhbGxldHM9e1tcIlBldHJhXCJdfVxuICAgICAgPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm1pbi1oLXNjcmVlbiBiZy1iYWNrZ3JvdW5kXCI+XG4gICAgICAgICAgPENvbXBvbmVudCB7Li4ucGFnZVByb3BzfSAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvQXB0b3NXYWxsZXRBZGFwdGVyUHJvdmlkZXI+XG4gICAgPC9FcnJvckJvdW5kYXJ5PlxuICApO1xufVxuXG5leHBvcnQgZGVmYXVsdCBNeUFwcDsgIl0sIm5hbWVzIjpbIkVycm9yQm91bmRhcnkiLCJBcHRvc1dhbGxldEFkYXB0ZXJQcm92aWRlciIsIk15QXBwIiwiQ29tcG9uZW50IiwicGFnZVByb3BzIiwiYXV0b0Nvbm5lY3QiLCJvbkVycm9yIiwiZXJyb3IiLCJjb25zb2xlIiwib3B0SW5XYWxsZXRzIiwiZGl2IiwiY2xhc3NOYW1lIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./src/pages/_app.tsx\n");

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

/***/ "@aptos-labs/wallet-adapter-react":
/*!***************************************************!*\
  !*** external "@aptos-labs/wallet-adapter-react" ***!
  \***************************************************/
/***/ ((module) => {

"use strict";
module.exports = import("@aptos-labs/wallet-adapter-react");;

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