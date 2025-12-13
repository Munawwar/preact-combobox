"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// lib/AutocompleteList.jsx
var AutocompleteList_exports = {};
__export(AutocompleteList_exports, {
  default: () => AutocompleteList_default
});
module.exports = __toCommonJS(AutocompleteList_exports);

// node_modules/preact/dist/preact.module.js
var n;
var l;
var u;
var t;
var i;
var r;
var o;
var e;
var f;
var c;
var s;
var a;
var h;
var p = {};
var v = [];
var y = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;
var d = Array.isArray;
function w(n2, l3) {
  for (var u4 in l3) n2[u4] = l3[u4];
  return n2;
}
function _(n2) {
  n2 && n2.parentNode && n2.parentNode.removeChild(n2);
}
function g(l3, u4, t3) {
  var i3, r3, o3, e3 = {};
  for (o3 in u4) "key" == o3 ? i3 = u4[o3] : "ref" == o3 ? r3 = u4[o3] : e3[o3] = u4[o3];
  if (arguments.length > 2 && (e3.children = arguments.length > 3 ? n.call(arguments, 2) : t3), "function" == typeof l3 && null != l3.defaultProps) for (o3 in l3.defaultProps) void 0 === e3[o3] && (e3[o3] = l3.defaultProps[o3]);
  return m(l3, e3, i3, r3, null);
}
function m(n2, t3, i3, r3, o3) {
  var e3 = { type: n2, props: t3, key: i3, ref: r3, __k: null, __: null, __b: 0, __e: null, __c: null, constructor: void 0, __v: null == o3 ? ++u : o3, __i: -1, __u: 0 };
  return null == o3 && null != l.vnode && l.vnode(e3), e3;
}
function k(n2) {
  return n2.children;
}
function x(n2, l3) {
  this.props = n2, this.context = l3;
}
function C(n2, l3) {
  if (null == l3) return n2.__ ? C(n2.__, n2.__i + 1) : null;
  for (var u4; l3 < n2.__k.length; l3++) if (null != (u4 = n2.__k[l3]) && null != u4.__e) return u4.__e;
  return "function" == typeof n2.type ? C(n2) : null;
}
function S(n2) {
  var l3, u4;
  if (null != (n2 = n2.__) && null != n2.__c) {
    for (n2.__e = n2.__c.base = null, l3 = 0; l3 < n2.__k.length; l3++) if (null != (u4 = n2.__k[l3]) && null != u4.__e) {
      n2.__e = n2.__c.base = u4.__e;
      break;
    }
    return S(n2);
  }
}
function M(n2) {
  (!n2.__d && (n2.__d = true) && i.push(n2) && !P.__r++ || r !== l.debounceRendering) && ((r = l.debounceRendering) || o)(P);
}
function P() {
  var n2, u4, t3, r3, o3, f4, c3, s3;
  for (i.sort(e); n2 = i.shift(); ) n2.__d && (u4 = i.length, r3 = void 0, f4 = (o3 = (t3 = n2).__v).__e, c3 = [], s3 = [], t3.__P && ((r3 = w({}, o3)).__v = o3.__v + 1, l.vnode && l.vnode(r3), j(t3.__P, r3, o3, t3.__n, t3.__P.namespaceURI, 32 & o3.__u ? [f4] : null, c3, null == f4 ? C(o3) : f4, !!(32 & o3.__u), s3), r3.__v = o3.__v, r3.__.__k[r3.__i] = r3, z(c3, r3, s3), r3.__e != f4 && S(r3)), i.length > u4 && i.sort(e));
  P.__r = 0;
}
function $(n2, l3, u4, t3, i3, r3, o3, e3, f4, c3, s3) {
  var a3, h3, y3, d3, w3, _3, g4 = t3 && t3.__k || v, m3 = l3.length;
  for (f4 = I(u4, l3, g4, f4, m3), a3 = 0; a3 < m3; a3++) null != (y3 = u4.__k[a3]) && (h3 = -1 === y3.__i ? p : g4[y3.__i] || p, y3.__i = a3, _3 = j(n2, y3, h3, i3, r3, o3, e3, f4, c3, s3), d3 = y3.__e, y3.ref && h3.ref != y3.ref && (h3.ref && V(h3.ref, null, y3), s3.push(y3.ref, y3.__c || d3, y3)), null == w3 && null != d3 && (w3 = d3), 4 & y3.__u || h3.__k === y3.__k ? f4 = A(y3, f4, n2) : "function" == typeof y3.type && void 0 !== _3 ? f4 = _3 : d3 && (f4 = d3.nextSibling), y3.__u &= -7);
  return u4.__e = w3, f4;
}
function I(n2, l3, u4, t3, i3) {
  var r3, o3, e3, f4, c3, s3 = u4.length, a3 = s3, h3 = 0;
  for (n2.__k = new Array(i3), r3 = 0; r3 < i3; r3++) null != (o3 = l3[r3]) && "boolean" != typeof o3 && "function" != typeof o3 ? (f4 = r3 + h3, (o3 = n2.__k[r3] = "string" == typeof o3 || "number" == typeof o3 || "bigint" == typeof o3 || o3.constructor == String ? m(null, o3, null, null, null) : d(o3) ? m(k, { children: o3 }, null, null, null) : void 0 === o3.constructor && o3.__b > 0 ? m(o3.type, o3.props, o3.key, o3.ref ? o3.ref : null, o3.__v) : o3).__ = n2, o3.__b = n2.__b + 1, e3 = null, -1 !== (c3 = o3.__i = L(o3, u4, f4, a3)) && (a3--, (e3 = u4[c3]) && (e3.__u |= 2)), null == e3 || null === e3.__v ? (-1 == c3 && h3--, "function" != typeof o3.type && (o3.__u |= 4)) : c3 != f4 && (c3 == f4 - 1 ? h3-- : c3 == f4 + 1 ? h3++ : (c3 > f4 ? h3-- : h3++, o3.__u |= 4))) : n2.__k[r3] = null;
  if (a3) for (r3 = 0; r3 < s3; r3++) null != (e3 = u4[r3]) && 0 == (2 & e3.__u) && (e3.__e == t3 && (t3 = C(e3)), q(e3, e3));
  return t3;
}
function A(n2, l3, u4) {
  var t3, i3;
  if ("function" == typeof n2.type) {
    for (t3 = n2.__k, i3 = 0; t3 && i3 < t3.length; i3++) t3[i3] && (t3[i3].__ = n2, l3 = A(t3[i3], l3, u4));
    return l3;
  }
  n2.__e != l3 && (l3 && n2.type && !u4.contains(l3) && (l3 = C(n2)), u4.insertBefore(n2.__e, l3 || null), l3 = n2.__e);
  do {
    l3 = l3 && l3.nextSibling;
  } while (null != l3 && 8 == l3.nodeType);
  return l3;
}
function H(n2, l3) {
  return l3 = l3 || [], null == n2 || "boolean" == typeof n2 || (d(n2) ? n2.some(function(n3) {
    H(n3, l3);
  }) : l3.push(n2)), l3;
}
function L(n2, l3, u4, t3) {
  var i3, r3, o3 = n2.key, e3 = n2.type, f4 = l3[u4];
  if (null === f4 || f4 && o3 == f4.key && e3 === f4.type && 0 == (2 & f4.__u)) return u4;
  if (t3 > (null != f4 && 0 == (2 & f4.__u) ? 1 : 0)) for (i3 = u4 - 1, r3 = u4 + 1; i3 >= 0 || r3 < l3.length; ) {
    if (i3 >= 0) {
      if ((f4 = l3[i3]) && 0 == (2 & f4.__u) && o3 == f4.key && e3 === f4.type) return i3;
      i3--;
    }
    if (r3 < l3.length) {
      if ((f4 = l3[r3]) && 0 == (2 & f4.__u) && o3 == f4.key && e3 === f4.type) return r3;
      r3++;
    }
  }
  return -1;
}
function T(n2, l3, u4) {
  "-" == l3[0] ? n2.setProperty(l3, null == u4 ? "" : u4) : n2[l3] = null == u4 ? "" : "number" != typeof u4 || y.test(l3) ? u4 : u4 + "px";
}
function F(n2, l3, u4, t3, i3) {
  var r3;
  n: if ("style" == l3) if ("string" == typeof u4) n2.style.cssText = u4;
  else {
    if ("string" == typeof t3 && (n2.style.cssText = t3 = ""), t3) for (l3 in t3) u4 && l3 in u4 || T(n2.style, l3, "");
    if (u4) for (l3 in u4) t3 && u4[l3] === t3[l3] || T(n2.style, l3, u4[l3]);
  }
  else if ("o" == l3[0] && "n" == l3[1]) r3 = l3 != (l3 = l3.replace(f, "$1")), l3 = l3.toLowerCase() in n2 || "onFocusOut" == l3 || "onFocusIn" == l3 ? l3.toLowerCase().slice(2) : l3.slice(2), n2.l || (n2.l = {}), n2.l[l3 + r3] = u4, u4 ? t3 ? u4.u = t3.u : (u4.u = c, n2.addEventListener(l3, r3 ? a : s, r3)) : n2.removeEventListener(l3, r3 ? a : s, r3);
  else {
    if ("http://www.w3.org/2000/svg" == i3) l3 = l3.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s");
    else if ("width" != l3 && "height" != l3 && "href" != l3 && "list" != l3 && "form" != l3 && "tabIndex" != l3 && "download" != l3 && "rowSpan" != l3 && "colSpan" != l3 && "role" != l3 && "popover" != l3 && l3 in n2) try {
      n2[l3] = null == u4 ? "" : u4;
      break n;
    } catch (n3) {
    }
    "function" == typeof u4 || (null == u4 || false === u4 && "-" != l3[4] ? n2.removeAttribute(l3) : n2.setAttribute(l3, "popover" == l3 && 1 == u4 ? "" : u4));
  }
}
function O(n2) {
  return function(u4) {
    if (this.l) {
      var t3 = this.l[u4.type + n2];
      if (null == u4.t) u4.t = c++;
      else if (u4.t < t3.u) return;
      return t3(l.event ? l.event(u4) : u4);
    }
  };
}
function j(n2, u4, t3, i3, r3, o3, e3, f4, c3, s3) {
  var a3, h3, p3, v3, y3, g4, m3, b2, C3, S2, M2, P4, I2, A4, H3, L2, T4, F4 = u4.type;
  if (void 0 !== u4.constructor) return null;
  128 & t3.__u && (c3 = !!(32 & t3.__u), o3 = [f4 = u4.__e = t3.__e]), (a3 = l.__b) && a3(u4);
  n: if ("function" == typeof F4) try {
    if (b2 = u4.props, C3 = "prototype" in F4 && F4.prototype.render, S2 = (a3 = F4.contextType) && i3[a3.__c], M2 = a3 ? S2 ? S2.props.value : a3.__ : i3, t3.__c ? m3 = (h3 = u4.__c = t3.__c).__ = h3.__E : (C3 ? u4.__c = h3 = new F4(b2, M2) : (u4.__c = h3 = new x(b2, M2), h3.constructor = F4, h3.render = B), S2 && S2.sub(h3), h3.props = b2, h3.state || (h3.state = {}), h3.context = M2, h3.__n = i3, p3 = h3.__d = true, h3.__h = [], h3._sb = []), C3 && null == h3.__s && (h3.__s = h3.state), C3 && null != F4.getDerivedStateFromProps && (h3.__s == h3.state && (h3.__s = w({}, h3.__s)), w(h3.__s, F4.getDerivedStateFromProps(b2, h3.__s))), v3 = h3.props, y3 = h3.state, h3.__v = u4, p3) C3 && null == F4.getDerivedStateFromProps && null != h3.componentWillMount && h3.componentWillMount(), C3 && null != h3.componentDidMount && h3.__h.push(h3.componentDidMount);
    else {
      if (C3 && null == F4.getDerivedStateFromProps && b2 !== v3 && null != h3.componentWillReceiveProps && h3.componentWillReceiveProps(b2, M2), !h3.__e && (null != h3.shouldComponentUpdate && false === h3.shouldComponentUpdate(b2, h3.__s, M2) || u4.__v == t3.__v)) {
        for (u4.__v != t3.__v && (h3.props = b2, h3.state = h3.__s, h3.__d = false), u4.__e = t3.__e, u4.__k = t3.__k, u4.__k.some(function(n3) {
          n3 && (n3.__ = u4);
        }), P4 = 0; P4 < h3._sb.length; P4++) h3.__h.push(h3._sb[P4]);
        h3._sb = [], h3.__h.length && e3.push(h3);
        break n;
      }
      null != h3.componentWillUpdate && h3.componentWillUpdate(b2, h3.__s, M2), C3 && null != h3.componentDidUpdate && h3.__h.push(function() {
        h3.componentDidUpdate(v3, y3, g4);
      });
    }
    if (h3.context = M2, h3.props = b2, h3.__P = n2, h3.__e = false, I2 = l.__r, A4 = 0, C3) {
      for (h3.state = h3.__s, h3.__d = false, I2 && I2(u4), a3 = h3.render(h3.props, h3.state, h3.context), H3 = 0; H3 < h3._sb.length; H3++) h3.__h.push(h3._sb[H3]);
      h3._sb = [];
    } else do {
      h3.__d = false, I2 && I2(u4), a3 = h3.render(h3.props, h3.state, h3.context), h3.state = h3.__s;
    } while (h3.__d && ++A4 < 25);
    h3.state = h3.__s, null != h3.getChildContext && (i3 = w(w({}, i3), h3.getChildContext())), C3 && !p3 && null != h3.getSnapshotBeforeUpdate && (g4 = h3.getSnapshotBeforeUpdate(v3, y3)), f4 = $(n2, d(L2 = null != a3 && a3.type === k && null == a3.key ? a3.props.children : a3) ? L2 : [L2], u4, t3, i3, r3, o3, e3, f4, c3, s3), h3.base = u4.__e, u4.__u &= -161, h3.__h.length && e3.push(h3), m3 && (h3.__E = h3.__ = null);
  } catch (n3) {
    if (u4.__v = null, c3 || null != o3) if (n3.then) {
      for (u4.__u |= c3 ? 160 : 128; f4 && 8 == f4.nodeType && f4.nextSibling; ) f4 = f4.nextSibling;
      o3[o3.indexOf(f4)] = null, u4.__e = f4;
    } else for (T4 = o3.length; T4--; ) _(o3[T4]);
    else u4.__e = t3.__e, u4.__k = t3.__k;
    l.__e(n3, u4, t3);
  }
  else null == o3 && u4.__v == t3.__v ? (u4.__k = t3.__k, u4.__e = t3.__e) : f4 = u4.__e = N(t3.__e, u4, t3, i3, r3, o3, e3, c3, s3);
  return (a3 = l.diffed) && a3(u4), 128 & u4.__u ? void 0 : f4;
}
function z(n2, u4, t3) {
  for (var i3 = 0; i3 < t3.length; i3++) V(t3[i3], t3[++i3], t3[++i3]);
  l.__c && l.__c(u4, n2), n2.some(function(u5) {
    try {
      n2 = u5.__h, u5.__h = [], n2.some(function(n3) {
        n3.call(u5);
      });
    } catch (n3) {
      l.__e(n3, u5.__v);
    }
  });
}
function N(u4, t3, i3, r3, o3, e3, f4, c3, s3) {
  var a3, h3, v3, y3, w3, g4, m3, b2 = i3.props, k3 = t3.props, x3 = t3.type;
  if ("svg" == x3 ? o3 = "http://www.w3.org/2000/svg" : "math" == x3 ? o3 = "http://www.w3.org/1998/Math/MathML" : o3 || (o3 = "http://www.w3.org/1999/xhtml"), null != e3) {
    for (a3 = 0; a3 < e3.length; a3++) if ((w3 = e3[a3]) && "setAttribute" in w3 == !!x3 && (x3 ? w3.localName == x3 : 3 == w3.nodeType)) {
      u4 = w3, e3[a3] = null;
      break;
    }
  }
  if (null == u4) {
    if (null == x3) return document.createTextNode(k3);
    u4 = document.createElementNS(o3, x3, k3.is && k3), c3 && (l.__m && l.__m(t3, e3), c3 = false), e3 = null;
  }
  if (null === x3) b2 === k3 || c3 && u4.data === k3 || (u4.data = k3);
  else {
    if (e3 = e3 && n.call(u4.childNodes), b2 = i3.props || p, !c3 && null != e3) for (b2 = {}, a3 = 0; a3 < u4.attributes.length; a3++) b2[(w3 = u4.attributes[a3]).name] = w3.value;
    for (a3 in b2) if (w3 = b2[a3], "children" == a3) ;
    else if ("dangerouslySetInnerHTML" == a3) v3 = w3;
    else if (!(a3 in k3)) {
      if ("value" == a3 && "defaultValue" in k3 || "checked" == a3 && "defaultChecked" in k3) continue;
      F(u4, a3, null, w3, o3);
    }
    for (a3 in k3) w3 = k3[a3], "children" == a3 ? y3 = w3 : "dangerouslySetInnerHTML" == a3 ? h3 = w3 : "value" == a3 ? g4 = w3 : "checked" == a3 ? m3 = w3 : c3 && "function" != typeof w3 || b2[a3] === w3 || F(u4, a3, w3, b2[a3], o3);
    if (h3) c3 || v3 && (h3.__html === v3.__html || h3.__html === u4.innerHTML) || (u4.innerHTML = h3.__html), t3.__k = [];
    else if (v3 && (u4.innerHTML = ""), $(u4, d(y3) ? y3 : [y3], t3, i3, r3, "foreignObject" == x3 ? "http://www.w3.org/1999/xhtml" : o3, e3, f4, e3 ? e3[0] : i3.__k && C(i3, 0), c3, s3), null != e3) for (a3 = e3.length; a3--; ) _(e3[a3]);
    c3 || (a3 = "value", "progress" == x3 && null == g4 ? u4.removeAttribute("value") : void 0 !== g4 && (g4 !== u4[a3] || "progress" == x3 && !g4 || "option" == x3 && g4 !== b2[a3]) && F(u4, a3, g4, b2[a3], o3), a3 = "checked", void 0 !== m3 && m3 !== u4[a3] && F(u4, a3, m3, b2[a3], o3));
  }
  return u4;
}
function V(n2, u4, t3) {
  try {
    if ("function" == typeof n2) {
      var i3 = "function" == typeof n2.__u;
      i3 && n2.__u(), i3 && null == u4 || (n2.__u = n2(u4));
    } else n2.current = u4;
  } catch (n3) {
    l.__e(n3, t3);
  }
}
function q(n2, u4, t3) {
  var i3, r3;
  if (l.unmount && l.unmount(n2), (i3 = n2.ref) && (i3.current && i3.current !== n2.__e || V(i3, null, u4)), null != (i3 = n2.__c)) {
    if (i3.componentWillUnmount) try {
      i3.componentWillUnmount();
    } catch (n3) {
      l.__e(n3, u4);
    }
    i3.base = i3.__P = null;
  }
  if (i3 = n2.__k) for (r3 = 0; r3 < i3.length; r3++) i3[r3] && q(i3[r3], u4, t3 || "function" != typeof n2.type);
  t3 || _(n2.__e), n2.__c = n2.__ = n2.__e = void 0;
}
function B(n2, l3, u4) {
  return this.constructor(n2, u4);
}
n = v.slice, l = { __e: function(n2, l3, u4, t3) {
  for (var i3, r3, o3; l3 = l3.__; ) if ((i3 = l3.__c) && !i3.__) try {
    if ((r3 = i3.constructor) && null != r3.getDerivedStateFromError && (i3.setState(r3.getDerivedStateFromError(n2)), o3 = i3.__d), null != i3.componentDidCatch && (i3.componentDidCatch(n2, t3 || {}), o3 = i3.__d), o3) return i3.__E = i3;
  } catch (l4) {
    n2 = l4;
  }
  throw n2;
} }, u = 0, t = function(n2) {
  return null != n2 && null == n2.constructor;
}, x.prototype.setState = function(n2, l3) {
  var u4;
  u4 = null != this.__s && this.__s !== this.state ? this.__s : this.__s = w({}, this.state), "function" == typeof n2 && (n2 = n2(w({}, u4), this.props)), n2 && w(u4, n2), null != n2 && this.__v && (l3 && this._sb.push(l3), M(this));
}, x.prototype.forceUpdate = function(n2) {
  this.__v && (this.__e = true, n2 && this.__h.push(n2), M(this));
}, x.prototype.render = k, i = [], o = "function" == typeof Promise ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, e = function(n2, l3) {
  return n2.__v.__b - l3.__v.__b;
}, P.__r = 0, f = /(PointerCapture)$|Capture$/i, c = 0, s = O(false), a = O(true), h = 0;

// node_modules/preact/hooks/dist/hooks.module.js
var t2;
var r2;
var u2;
var i2;
var o2 = 0;
var f2 = [];
var c2 = l;
var e2 = c2.__b;
var a2 = c2.__r;
var v2 = c2.diffed;
var l2 = c2.__c;
var m2 = c2.unmount;
var s2 = c2.__;
function d2(n2, t3) {
  c2.__h && c2.__h(r2, n2, o2 || t3), o2 = 0;
  var u4 = r2.__H || (r2.__H = { __: [], __h: [] });
  return n2 >= u4.__.length && u4.__.push({}), u4.__[n2];
}
function h2(n2) {
  return o2 = 1, p2(D, n2);
}
function p2(n2, u4, i3) {
  var o3 = d2(t2++, 2);
  if (o3.t = n2, !o3.__c && (o3.__ = [i3 ? i3(u4) : D(void 0, u4), function(n3) {
    var t3 = o3.__N ? o3.__N[0] : o3.__[0], r3 = o3.t(t3, n3);
    t3 !== r3 && (o3.__N = [r3, o3.__[1]], o3.__c.setState({}));
  }], o3.__c = r2, !r2.u)) {
    var f4 = function(n3, t3, r3) {
      if (!o3.__c.__H) return true;
      var u5 = o3.__c.__H.__.filter(function(n4) {
        return !!n4.__c;
      });
      if (u5.every(function(n4) {
        return !n4.__N;
      })) return !c3 || c3.call(this, n3, t3, r3);
      var i4 = o3.__c.props !== n3;
      return u5.forEach(function(n4) {
        if (n4.__N) {
          var t4 = n4.__[0];
          n4.__ = n4.__N, n4.__N = void 0, t4 !== n4.__[0] && (i4 = true);
        }
      }), c3 && c3.call(this, n3, t3, r3) || i4;
    };
    r2.u = true;
    var c3 = r2.shouldComponentUpdate, e3 = r2.componentWillUpdate;
    r2.componentWillUpdate = function(n3, t3, r3) {
      if (this.__e) {
        var u5 = c3;
        c3 = void 0, f4(n3, t3, r3), c3 = u5;
      }
      e3 && e3.call(this, n3, t3, r3);
    }, r2.shouldComponentUpdate = f4;
  }
  return o3.__N || o3.__;
}
function y2(n2, u4) {
  var i3 = d2(t2++, 3);
  !c2.__s && C2(i3.__H, u4) && (i3.__ = n2, i3.i = u4, r2.__H.__h.push(i3));
}
function _2(n2, u4) {
  var i3 = d2(t2++, 4);
  !c2.__s && C2(i3.__H, u4) && (i3.__ = n2, i3.i = u4, r2.__h.push(i3));
}
function A2(n2) {
  return o2 = 5, T2(function() {
    return { current: n2 };
  }, []);
}
function F2(n2, t3, r3) {
  o2 = 6, _2(function() {
    return "function" == typeof n2 ? (n2(t3()), function() {
      return n2(null);
    }) : n2 ? (n2.current = t3(), function() {
      return n2.current = null;
    }) : void 0;
  }, null == r3 ? r3 : r3.concat(n2));
}
function T2(n2, r3) {
  var u4 = d2(t2++, 7);
  return C2(u4.__H, r3) && (u4.__ = n2(), u4.__H = r3, u4.__h = n2), u4.__;
}
function q2(n2, t3) {
  return o2 = 8, T2(function() {
    return n2;
  }, t3);
}
function j2() {
  for (var n2; n2 = f2.shift(); ) if (n2.__P && n2.__H) try {
    n2.__H.__h.forEach(z2), n2.__H.__h.forEach(B2), n2.__H.__h = [];
  } catch (t3) {
    n2.__H.__h = [], c2.__e(t3, n2.__v);
  }
}
c2.__b = function(n2) {
  r2 = null, e2 && e2(n2);
}, c2.__ = function(n2, t3) {
  n2 && t3.__k && t3.__k.__m && (n2.__m = t3.__k.__m), s2 && s2(n2, t3);
}, c2.__r = function(n2) {
  a2 && a2(n2), t2 = 0;
  var i3 = (r2 = n2.__c).__H;
  i3 && (u2 === r2 ? (i3.__h = [], r2.__h = [], i3.__.forEach(function(n3) {
    n3.__N && (n3.__ = n3.__N), n3.i = n3.__N = void 0;
  })) : (i3.__h.forEach(z2), i3.__h.forEach(B2), i3.__h = [], t2 = 0)), u2 = r2;
}, c2.diffed = function(n2) {
  v2 && v2(n2);
  var t3 = n2.__c;
  t3 && t3.__H && (t3.__H.__h.length && (1 !== f2.push(t3) && i2 === c2.requestAnimationFrame || ((i2 = c2.requestAnimationFrame) || w2)(j2)), t3.__H.__.forEach(function(n3) {
    n3.i && (n3.__H = n3.i), n3.i = void 0;
  })), u2 = r2 = null;
}, c2.__c = function(n2, t3) {
  t3.some(function(n3) {
    try {
      n3.__h.forEach(z2), n3.__h = n3.__h.filter(function(n4) {
        return !n4.__ || B2(n4);
      });
    } catch (r3) {
      t3.some(function(n4) {
        n4.__h && (n4.__h = []);
      }), t3 = [], c2.__e(r3, n3.__v);
    }
  }), l2 && l2(n2, t3);
}, c2.unmount = function(n2) {
  m2 && m2(n2);
  var t3, r3 = n2.__c;
  r3 && r3.__H && (r3.__H.__.forEach(function(n3) {
    try {
      z2(n3);
    } catch (n4) {
      t3 = n4;
    }
  }), r3.__H = void 0, t3 && c2.__e(t3, r3.__v));
};
var k2 = "function" == typeof requestAnimationFrame;
function w2(n2) {
  var t3, r3 = function() {
    clearTimeout(u4), k2 && cancelAnimationFrame(t3), setTimeout(n2);
  }, u4 = setTimeout(r3, 100);
  k2 && (t3 = requestAnimationFrame(r3));
}
function z2(n2) {
  var t3 = r2, u4 = n2.__c;
  "function" == typeof u4 && (n2.__c = void 0, u4()), r2 = t3;
}
function B2(n2) {
  var t3 = r2;
  n2.__c = n2.__(), r2 = t3;
}
function C2(n2, t3) {
  return !n2 || n2.length !== t3.length || t3.some(function(t4, r3) {
    return t4 !== n2[r3];
  });
}
function D(n2, t3) {
  return "function" == typeof t3 ? t3(n2) : t3;
}

// node_modules/preact/compat/dist/compat.module.js
function g3(n2, t3) {
  for (var e3 in t3) n2[e3] = t3[e3];
  return n2;
}
function E2(n2, t3) {
  for (var e3 in n2) if ("__source" !== e3 && !(e3 in t3)) return true;
  for (var r3 in t3) if ("__source" !== r3 && n2[r3] !== t3[r3]) return true;
  return false;
}
function N2(n2, t3) {
  this.props = n2, this.context = t3;
}
(N2.prototype = new x()).isPureReactComponent = true, N2.prototype.shouldComponentUpdate = function(n2, t3) {
  return E2(this.props, n2) || E2(this.state, t3);
};
var T3 = l.__b;
l.__b = function(n2) {
  n2.type && n2.type.__f && n2.ref && (n2.props.ref = n2.ref, n2.ref = null), T3 && T3(n2);
};
var A3 = "undefined" != typeof Symbol && Symbol.for && /* @__PURE__ */ Symbol.for("react.forward_ref") || 3911;
function D3(n2) {
  function t3(t4) {
    var e3 = g3({}, t4);
    return delete e3.ref, n2(e3, t4.ref || null);
  }
  return t3.$$typeof = A3, t3.render = t3, t3.prototype.isReactComponent = t3.__f = true, t3.displayName = "ForwardRef(" + (n2.displayName || n2.name) + ")", t3;
}
var F3 = l.__e;
l.__e = function(n2, t3, e3, r3) {
  if (n2.then) {
    for (var u4, o3 = t3; o3 = o3.__; ) if ((u4 = o3.__c) && u4.__c) return null == t3.__e && (t3.__e = e3.__e, t3.__k = e3.__k), u4.__c(n2, t3);
  }
  F3(n2, t3, e3, r3);
};
var U = l.unmount;
function V2(n2, t3, e3) {
  return n2 && (n2.__c && n2.__c.__H && (n2.__c.__H.__.forEach(function(n3) {
    "function" == typeof n3.__c && n3.__c();
  }), n2.__c.__H = null), null != (n2 = g3({}, n2)).__c && (n2.__c.__P === e3 && (n2.__c.__P = t3), n2.__c = null), n2.__k = n2.__k && n2.__k.map(function(n3) {
    return V2(n3, t3, e3);
  })), n2;
}
function W(n2, t3, e3) {
  return n2 && e3 && (n2.__v = null, n2.__k = n2.__k && n2.__k.map(function(n3) {
    return W(n3, t3, e3);
  }), n2.__c && n2.__c.__P === t3 && (n2.__e && e3.appendChild(n2.__e), n2.__c.__e = true, n2.__c.__P = e3)), n2;
}
function P3() {
  this.__u = 0, this.o = null, this.__b = null;
}
function j3(n2) {
  var t3 = n2.__.__c;
  return t3 && t3.__a && t3.__a(n2);
}
function B3() {
  this.i = null, this.l = null;
}
l.unmount = function(n2) {
  var t3 = n2.__c;
  t3 && t3.__R && t3.__R(), t3 && 32 & n2.__u && (n2.type = null), U && U(n2);
}, (P3.prototype = new x()).__c = function(n2, t3) {
  var e3 = t3.__c, r3 = this;
  null == r3.o && (r3.o = []), r3.o.push(e3);
  var u4 = j3(r3.__v), o3 = false, i3 = function() {
    o3 || (o3 = true, e3.__R = null, u4 ? u4(c3) : c3());
  };
  e3.__R = i3;
  var c3 = function() {
    if (!--r3.__u) {
      if (r3.state.__a) {
        var n3 = r3.state.__a;
        r3.__v.__k[0] = W(n3, n3.__c.__P, n3.__c.__O);
      }
      var t4;
      for (r3.setState({ __a: r3.__b = null }); t4 = r3.o.pop(); ) t4.forceUpdate();
    }
  };
  r3.__u++ || 32 & t3.__u || r3.setState({ __a: r3.__b = r3.__v.__k[0] }), n2.then(i3, i3);
}, P3.prototype.componentWillUnmount = function() {
  this.o = [];
}, P3.prototype.render = function(n2, e3) {
  if (this.__b) {
    if (this.__v.__k) {
      var r3 = document.createElement("div"), o3 = this.__v.__k[0].__c;
      this.__v.__k[0] = V2(this.__b, r3, o3.__O = o3.__P);
    }
    this.__b = null;
  }
  var i3 = e3.__a && g(k, null, n2.fallback);
  return i3 && (i3.__u &= -33), [g(k, null, e3.__a ? null : n2.children), i3];
};
var H2 = function(n2, t3, e3) {
  if (++e3[1] === e3[0] && n2.l.delete(t3), n2.props.revealOrder && ("t" !== n2.props.revealOrder[0] || !n2.l.size)) for (e3 = n2.i; e3; ) {
    for (; e3.length > 3; ) e3.pop()();
    if (e3[1] < e3[0]) break;
    n2.i = e3 = e3[2];
  }
};
(B3.prototype = new x()).__a = function(n2) {
  var t3 = this, e3 = j3(t3.__v), r3 = t3.l.get(n2);
  return r3[0]++, function(u4) {
    var o3 = function() {
      t3.props.revealOrder ? (r3.push(u4), H2(t3, n2, r3)) : u4();
    };
    e3 ? e3(o3) : o3();
  };
}, B3.prototype.render = function(n2) {
  this.i = null, this.l = /* @__PURE__ */ new Map();
  var t3 = H(n2.children);
  n2.revealOrder && "b" === n2.revealOrder[0] && t3.reverse();
  for (var e3 = t3.length; e3--; ) this.l.set(t3[e3], this.i = [1, 0, this.i]);
  return n2.children;
}, B3.prototype.componentDidUpdate = B3.prototype.componentDidMount = function() {
  var n2 = this;
  this.l.forEach(function(t3, e3) {
    H2(n2, e3, t3);
  });
};
var q3 = "undefined" != typeof Symbol && Symbol.for && /* @__PURE__ */ Symbol.for("react.element") || 60103;
var G2 = /^(?:accent|alignment|arabic|baseline|cap|clip(?!PathU)|color|dominant|fill|flood|font|glyph(?!R)|horiz|image(!S)|letter|lighting|marker(?!H|W|U)|overline|paint|pointer|shape|stop|strikethrough|stroke|text(?!L)|transform|underline|unicode|units|v|vector|vert|word|writing|x(?!C))[A-Z]/;
var J2 = /^on(Ani|Tra|Tou|BeforeInp|Compo)/;
var K = /[A-Z0-9]/g;
var Q = "undefined" != typeof document;
var X = function(n2) {
  return ("undefined" != typeof Symbol && "symbol" == typeof /* @__PURE__ */ Symbol() ? /fil|che|rad/ : /fil|che|ra/).test(n2);
};
x.prototype.isReactComponent = {}, ["componentWillMount", "componentWillReceiveProps", "componentWillUpdate"].forEach(function(t3) {
  Object.defineProperty(x.prototype, t3, { configurable: true, get: function() {
    return this["UNSAFE_" + t3];
  }, set: function(n2) {
    Object.defineProperty(this, t3, { configurable: true, writable: true, value: n2 });
  } });
});
var en = l.event;
function rn() {
}
function un() {
  return this.cancelBubble;
}
function on() {
  return this.defaultPrevented;
}
l.event = function(n2) {
  return en && (n2 = en(n2)), n2.persist = rn, n2.isPropagationStopped = un, n2.isDefaultPrevented = on, n2.nativeEvent = n2;
};
var cn;
var ln = { enumerable: false, configurable: true, get: function() {
  return this.class;
} };
var fn = l.vnode;
l.vnode = function(n2) {
  "string" == typeof n2.type && (function(n3) {
    var t3 = n3.props, e3 = n3.type, u4 = {}, o3 = -1 === e3.indexOf("-");
    for (var i3 in t3) {
      var c3 = t3[i3];
      if (!("value" === i3 && "defaultValue" in t3 && null == c3 || Q && "children" === i3 && "noscript" === e3 || "class" === i3 || "className" === i3)) {
        var l3 = i3.toLowerCase();
        "defaultValue" === i3 && "value" in t3 && null == t3.value ? i3 = "value" : "download" === i3 && true === c3 ? c3 = "" : "translate" === l3 && "no" === c3 ? c3 = false : "o" === l3[0] && "n" === l3[1] ? "ondoubleclick" === l3 ? i3 = "ondblclick" : "onchange" !== l3 || "input" !== e3 && "textarea" !== e3 || X(t3.type) ? "onfocus" === l3 ? i3 = "onfocusin" : "onblur" === l3 ? i3 = "onfocusout" : J2.test(i3) && (i3 = l3) : l3 = i3 = "oninput" : o3 && G2.test(i3) ? i3 = i3.replace(K, "-$&").toLowerCase() : null === c3 && (c3 = void 0), "oninput" === l3 && u4[i3 = l3] && (i3 = "oninputCapture"), u4[i3] = c3;
      }
    }
    "select" == e3 && u4.multiple && Array.isArray(u4.value) && (u4.value = H(t3.children).forEach(function(n4) {
      n4.props.selected = -1 != u4.value.indexOf(n4.props.value);
    })), "select" == e3 && null != u4.defaultValue && (u4.value = H(t3.children).forEach(function(n4) {
      n4.props.selected = u4.multiple ? -1 != u4.defaultValue.indexOf(n4.props.value) : u4.defaultValue == n4.props.value;
    })), t3.class && !t3.className ? (u4.class = t3.class, Object.defineProperty(u4, "className", ln)) : (t3.className && !t3.class || t3.class && t3.className) && (u4.class = u4.className = t3.className), n3.props = u4;
  })(n2), n2.$$typeof = q3, fn && fn(n2);
};
var an = l.__r;
l.__r = function(n2) {
  an && an(n2), cn = n2.__c;
};
var sn = l.diffed;
l.diffed = function(n2) {
  sn && sn(n2);
  var t3 = n2.props, e3 = n2.__e;
  null != e3 && "textarea" === n2.type && "value" in t3 && t3.value !== e3.value && (e3.value = null == t3.value ? "" : t3.value), cn = null;
};

// lib/hooks.js
function isEqual(value1, value2) {
  const seenA = /* @__PURE__ */ new WeakMap();
  const seenB = /* @__PURE__ */ new WeakMap();
  function deepCompare(a3, b2) {
    if (Object.is(a3, b2)) return true;
    if (a3 === null || b2 === null || typeof a3 !== "object" || typeof b2 !== "object") {
      return a3 === b2;
    }
    if (a3.$$typeof === /* @__PURE__ */ Symbol.for("react.element") || b2.$$typeof === /* @__PURE__ */ Symbol.for("react.element")) {
      return a3 === b2;
    }
    if (Object.getPrototypeOf(a3) !== Object.getPrototypeOf(b2)) {
      return false;
    }
    if (seenA.has(a3)) return seenA.get(a3) === b2;
    if (seenB.has(b2)) return seenB.get(b2) === a3;
    if (seenA.has(b2) || seenB.has(a3)) return false;
    seenA.set(a3, b2);
    seenB.set(b2, a3);
    if (Array.isArray(a3)) {
      if (a3.length !== b2.length) {
        return false;
      }
      return a3.every((item, index) => deepCompare(item, b2[index]));
    }
    if (a3 instanceof Date) {
      return a3.getTime() === b2.getTime();
    }
    if (a3 instanceof RegExp) {
      return a3.toString() === b2.toString();
    }
    const keysA = Object.keys(a3);
    const keysB = Object.keys(b2);
    if (keysA.length !== keysB.length) return false;
    return keysA.every((key) => keysB.includes(key) && deepCompare(a3[key], b2[key]));
  }
  return deepCompare(value1, value2);
}
function useDeepMemo(newState) {
  const state = A2(
    /** @type {T} */
    null
  );
  if (!isEqual(newState, state.current)) {
    state.current = newState;
  }
  return state.current;
}
var isTouchDevice = typeof window !== "undefined" && window.matchMedia?.("(pointer: coarse)")?.matches;
var visualViewportInitialHeight = window.visualViewport?.height ?? 0;

// node_modules/preact/jsx-runtime/dist/jsxRuntime.module.js
var f3 = 0;
function u3(e3, t3, n2, o3, i3, u4) {
  t3 || (t3 = {});
  var a3, c3, p3 = t3;
  if ("ref" in p3) for (c3 in p3 = {}, t3) "ref" == c3 ? a3 = t3[c3] : p3[c3] = t3[c3];
  var l3 = { type: e3, props: p3, key: n2, ref: a3, __k: null, __: null, __b: 0, __e: null, __c: null, constructor: void 0, __v: --f3, __i: -1, __u: 0, __source: i3, __self: u4 };
  if ("function" == typeof e3 && (a3 = e3.defaultProps)) for (c3 in a3) void 0 === p3[c3] && (p3[c3] = a3[c3]);
  return l.vnode && l.vnode(l3), l3;
}

// lib/utils.jsx
var languageCache = {};
function toHTMLId(text) {
  return text.replace(/[^a-zA-Z0-9\-_:.]/g, "");
}
function sortValuesToTop(options, values) {
  const selectedSet = new Set(values);
  return options.sort((a3, b2) => {
    const aSelected = selectedSet.has(a3.value);
    const bSelected = selectedSet.has(b2.value);
    if (aSelected === bSelected) return 0;
    return aSelected ? -1 : 1;
  });
}
function getExactMatchScore(query, option, language) {
  const { label, value, ...rest } = option;
  if (value === query) {
    return {
      ...rest,
      label,
      value,
      score: 9,
      /** @type {'value'} */
      matched: "value",
      /** @type {Array<[number, number]>} */
      matchSlices: [[0, value.length]]
    };
  }
  if (label === query) {
    return {
      ...rest,
      label,
      value,
      score: 9,
      /** @type {'label'} */
      matched: "label",
      /** @type {Array<[number, number]>} */
      matchSlices: [[0, label.length]]
    };
  }
  const { caseMatcher } = (
    /** @type {LanguageCache} */
    languageCache[language]
  );
  if (caseMatcher.compare(value, query) === 0) {
    return {
      ...rest,
      label,
      value,
      score: 7,
      /** @type {'value'} */
      matched: "value",
      /** @type {Array<[number, number]>} */
      matchSlices: [[0, value.length]]
    };
  }
  if (caseMatcher.compare(label, query) === 0) {
    return {
      ...rest,
      label,
      value,
      score: 7,
      /** @type {'label'} */
      matched: "label",
      /** @type {Array<[number, number]>} */
      matchSlices: [[0, label.length]]
    };
  }
  return null;
}
function getMatchScore(query, options, language = "en", filterAndSort = true) {
  query = query.trim();
  if (!query) {
    const matchSlices = (
      /** @type {Array<[number, number]>} */
      []
    );
    return options.map((option) => ({
      ...option,
      label: option.label,
      value: option.value,
      score: 0,
      matched: "none",
      matchSlices
    }));
  }
  if (!languageCache[language]) {
    languageCache[language] = {
      baseMatcher: new Intl.Collator(language, {
        usage: "search",
        sensitivity: "base"
      }),
      caseMatcher: new Intl.Collator(language, {
        usage: "search",
        sensitivity: "accent"
      }),
      wordSegmenter: new Intl.Segmenter(language, {
        granularity: "word"
      })
    };
  }
  const { baseMatcher, caseMatcher, wordSegmenter } = languageCache[language];
  const isCommaSeparated = query.includes(",");
  let matches = options.map((option) => {
    const { label, value, ...rest } = option;
    if (isCommaSeparated) {
      const querySegments2 = query.split(",");
      const matches2 = querySegments2.map((querySegment) => getExactMatchScore(querySegment.trim(), option, language)).filter((match) => match !== null).sort((a3, b2) => b2.score - a3.score);
      return (
        /** @type {OptionMatch} */
        matches2[0] || {
          ...rest,
          label,
          value,
          score: 0,
          matched: "none"
        }
      );
    }
    const exactMatch = getExactMatchScore(query, option, language);
    if (exactMatch) {
      return exactMatch;
    }
    if (baseMatcher.compare(label, query) === 0) {
      return {
        ...rest,
        label,
        value,
        score: 5,
        /** @type {'label'} */
        matched: "label",
        /** @type {Array<[number, number]>} */
        matchSlices: [[0, label.length]]
      };
    }
    if (baseMatcher.compare(value, query) === 0) {
      return {
        ...rest,
        label,
        value,
        score: 5,
        /** @type {'value'} */
        matched: "value",
        /** @type {Array<[number, number]>} */
        matchSlices: [[0, value.length]]
      };
    }
    const querySegments = Array.from(wordSegmenter.segment(query));
    const labelWordSegments = Array.from(wordSegmenter.segment(label.trim()));
    let len = 0;
    let firstIndex = -1;
    for (let i3 = 0; i3 < labelWordSegments.length; i3++) {
      const labelWordSegment = (
        /** @type {Intl.SegmentData} */
        labelWordSegments[i3]
      );
      const querySegment = querySegments[len];
      if (!querySegment) break;
      if (len === querySegments.length - 1) {
        const lastQueryWord = querySegment.segment;
        if (baseMatcher.compare(
          labelWordSegment.segment.slice(0, lastQueryWord.length),
          lastQueryWord
        ) === 0) {
          return {
            ...rest,
            label,
            value,
            score: 3,
            /** @type {'label'} */
            matched: "label",
            /** @type {Array<[number, number]>} */
            // @ts-ignore
            matchSlices: [
              [
                firstIndex > -1 ? firstIndex : labelWordSegment.index,
                labelWordSegment.index + lastQueryWord.length
              ]
            ]
          };
        }
      } else if (baseMatcher.compare(labelWordSegment.segment, querySegment.segment) === 0) {
        len++;
        if (len === 1) {
          firstIndex = labelWordSegment.index;
        }
        continue;
      }
      len = 0;
      firstIndex = -1;
    }
    if (caseMatcher.compare(value.slice(0, query.length), query) === 0) {
      return {
        ...rest,
        label,
        value,
        score: 3,
        /** @type {'value'} */
        matched: "value",
        /** @type {Array<[number, number]>} */
        matchSlices: [[0, query.length]]
      };
    }
    const queryWords = querySegments.filter((s3) => s3.isWordLike);
    const labelWords = labelWordSegments.filter((s3) => s3.isWordLike);
    const slices = queryWords.map((word) => {
      const match = labelWords.find(
        (labelWord) => baseMatcher.compare(labelWord.segment, word.segment) === 0
      );
      if (match) {
        return [match.index, match.index + match.segment.length];
      }
    });
    const matchSlices = slices.filter((s3) => s3 !== void 0).sort((a3, b2) => a3[0] - b2[0]);
    const wordScoring = matchSlices.length / queryWords.length;
    return {
      ...rest,
      label,
      value,
      score: wordScoring,
      /** @type {'label'|'none'} */
      matched: wordScoring ? "label" : "none",
      matchSlices
    };
  });
  if (filterAndSort) {
    matches = matches.filter((match) => match.score > 0);
    matches.sort((a3, b2) => {
      if (a3.score === b2.score) {
        const val = a3.label.localeCompare(b2.label, void 0, {
          sensitivity: "base"
        });
        return val === 0 ? a3.value.localeCompare(b2.value, void 0, { sensitivity: "base" }) : val;
      }
      return b2.score - a3.score;
    });
  }
  return matches;
}

// lib/AutocompleteList.jsx
var isPlaywright = navigator.webdriver === true;
var AutocompleteList = D3(
  ({
    id,
    searchText,
    allowedOptions,
    arrayValues,
    invalidValues,
    multiple,
    allowFreeText,
    language,
    maxNumberOfPresentedOptions,
    onOptionSelect,
    onActiveDescendantChange,
    onClose,
    optionRenderer,
    warningIcon,
    tickIcon,
    optionIconRenderer,
    showValue,
    loadingRenderer,
    translations,
    theme,
    isOpen,
    shouldUseTray,
    setDropdownRef
  }, ref) => {
    const [filteredOptions, setFilteredOptions] = h2(
      /** @type {OptionMatch[]} */
      []
    );
    const [isLoading, setIsLoading] = h2(false);
    const [activeDescendant, setActiveDescendant] = h2("");
    const cachedOptions = A2(
      /** @type {{ [value: string]: Option }} */
      {}
    );
    const abortControllerRef = A2(
      /** @type {AbortController | null} */
      null
    );
    const inputTypingDebounceTimer = A2(
      /** @type {any} */
      null
    );
    const listRef = A2(
      /** @type {HTMLUListElement | null} */
      null
    );
    const searchTextTrimmed = searchText.trim();
    const allowedOptionsAsKey = useDeepMemo(
      typeof allowedOptions === "function" ? null : allowedOptions
    );
    const updateCachedOptions = q2(
      /** @param {Option[]} update */
      (update) => {
        for (const item of update) {
          cachedOptions.current[item.value] = item;
        }
      },
      []
    );
    const allOptions = useDeepMemo(
      Array.isArray(allowedOptions) ? allowedOptions : Object.values(cachedOptions.current)
    );
    const allOptionsLookup = T2(
      () => allOptions.reduce(
        (acc, o3) => {
          acc[o3.value] = o3;
          return acc;
        },
        /** @type {{ [value: string]: Option }} */
        {}
      ),
      [allOptions]
    );
    const newUnknownValues = arrayValues.filter((v3) => !allOptionsLookup[v3]);
    const newUnknownValuesAsKey = useDeepMemo(newUnknownValues);
    const addNewOptionVisible = !isLoading && allowFreeText && searchTextTrimmed && !arrayValues.includes(searchTextTrimmed) && !filteredOptions.find((o3) => o3.value === searchTextTrimmed);
    const scrollOptionIntoView = q2(
      /** @param {string} optionValue */
      (optionValue) => {
        if (!listRef.current || !optionValue) return;
        const elementId = `${id}-option-${toHTMLId(optionValue)}`;
        const element = listRef.current.querySelector(`#${elementId}`);
        if (element) {
          const listRect = listRef.current.getBoundingClientRect();
          const itemRect = element.getBoundingClientRect();
          if (itemRect.bottom > listRect.bottom) {
            element.scrollIntoView({ block: "end" });
          } else if (itemRect.top < listRect.top) {
            element.scrollIntoView({ block: "start" });
          }
        }
      },
      [id]
    );
    const getNavigableOptions = q2(() => {
      const options = filteredOptions.filter((o3) => !o3.disabled).map((o3) => o3.value);
      if (addNewOptionVisible) {
        return [searchTextTrimmed, ...options];
      }
      return options;
    }, [filteredOptions, addNewOptionVisible, searchTextTrimmed]);
    F2(
      ref,
      () => ({
        navigateDown: () => {
          const options = getNavigableOptions();
          if (options.length === 0) return;
          const currentIndex = activeDescendant ? options.indexOf(activeDescendant) : -1;
          const nextIndex = currentIndex === options.length - 1 ? 0 : currentIndex + 1;
          const nextValue = options[nextIndex];
          if (nextValue !== void 0) {
            setActiveDescendant(nextValue);
            scrollOptionIntoView(nextValue);
          }
        },
        navigateUp: () => {
          const options = getNavigableOptions();
          if (options.length === 0) return;
          const currentIndex = activeDescendant ? options.indexOf(activeDescendant) : 0;
          const prevIndex = currentIndex <= 0 ? options.length - 1 : currentIndex - 1;
          const prevValue = options[prevIndex];
          if (prevValue !== void 0) {
            setActiveDescendant(prevValue);
            scrollOptionIntoView(prevValue);
          }
        },
        navigateToFirst: () => {
          const options = getNavigableOptions();
          if (options.length === 0) return;
          const firstValue = options[0];
          if (firstValue !== void 0) {
            setActiveDescendant(firstValue);
            scrollOptionIntoView(firstValue);
          }
        },
        navigateToLast: () => {
          const options = getNavigableOptions();
          if (options.length === 0) return;
          const lastValue = options[options.length - 1];
          if (lastValue !== void 0) {
            setActiveDescendant(lastValue);
            scrollOptionIntoView(lastValue);
          }
        },
        selectActive: () => {
          if (!activeDescendant) return false;
          if (addNewOptionVisible && activeDescendant === searchTextTrimmed) {
            onOptionSelect(searchTextTrimmed);
            if (!multiple && onClose) {
              onClose();
            }
            return true;
          }
          const option = filteredOptions.find((o3) => o3.value === activeDescendant);
          if (option && !option.disabled) {
            onOptionSelect(option.value, { toggleSelected: true });
            if (!multiple && onClose) {
              onClose();
            }
            return true;
          }
          return false;
        },
        getActiveDescendant: () => activeDescendant,
        setActiveDescendant: (value) => {
          setActiveDescendant(value);
          scrollOptionIntoView(value);
        },
        clearActiveDescendant: () => setActiveDescendant("")
      }),
      [
        activeDescendant,
        getNavigableOptions,
        scrollOptionIntoView,
        addNewOptionVisible,
        searchTextTrimmed,
        filteredOptions,
        onOptionSelect,
        multiple,
        onClose
      ]
    );
    y2(() => {
      if (!isOpen) {
        setActiveDescendant("");
      }
    }, [isOpen]);
    y2(() => {
      onActiveDescendantChange?.(activeDescendant);
    }, [activeDescendant, onActiveDescendantChange]);
    y2(() => {
      const shouldFetchOptions = isOpen || typeof allowedOptions === "function";
      if (!shouldFetchOptions) return;
      const abortController = typeof allowedOptions === "function" ? new AbortController() : null;
      abortControllerRef.current?.abort();
      abortControllerRef.current = abortController;
      let debounceTime = 0;
      if (typeof allowedOptions === "function" && !// don't debounce for initial render (when we have to resolve the labels for selected values).
      // don't debounce for first time the dropdown is opened as well.
      (newUnknownValues.length > 0 || isOpen) && // Hack: We avoid debouncing to speed up playwright tests
      !isPlaywright) {
        debounceTime = 250;
      }
      clearTimeout(inputTypingDebounceTimer.current);
      const callback = async () => {
        if (typeof allowedOptions === "function") {
          const signal = (
            /** @type {AbortSignal} */
            abortController.signal
          );
          const [searchResults, selectedResults] = await Promise.all([
            isOpen ? allowedOptions(searchTextTrimmed, maxNumberOfPresentedOptions, arrayValues, signal) : (
              /** @type {Option[]} */
              []
            ),
            // We need to fetch unknown options's labels regardless of whether the dropdown
            // is open or not, because we want to show it in the placeholder.
            newUnknownValues.length > 0 ? allowedOptions(newUnknownValues, newUnknownValues.length, arrayValues, signal) : null
          ]).catch((error) => {
            if (signal.aborted) {
              return [null, null];
            }
            setIsLoading(false);
            throw error;
          });
          setIsLoading(false);
          if (searchResults?.length) {
            updateCachedOptions(searchResults);
          }
          if (selectedResults?.length) {
            updateCachedOptions(selectedResults);
          }
          let updatedOptions = searchResults || [];
          if (!searchTextTrimmed) {
            const unreturnedValues = newUnknownValues.filter((v3) => !cachedOptions.current[v3]).map((v3) => ({ label: v3, value: v3 }));
            if (unreturnedValues.length > 0) {
              updateCachedOptions(unreturnedValues);
              updatedOptions = unreturnedValues.concat(searchResults || []);
            }
          }
          const options = searchTextTrimmed ? updatedOptions : sortValuesToTop(updatedOptions, arrayValues);
          setFilteredOptions(getMatchScore(searchTextTrimmed, options, language, false));
        } else {
          const mergedOptions = arrayValues.filter((v3) => !allOptionsLookup[v3]).map((v3) => ({ label: v3, value: v3 })).concat(allowedOptions);
          const options = searchText ? mergedOptions : sortValuesToTop(mergedOptions, arrayValues);
          setFilteredOptions(getMatchScore(searchText, options, language, true));
        }
      };
      if (typeof allowedOptions === "function") {
        setIsLoading(true);
      }
      let timer = null;
      if (debounceTime > 0) {
        timer = setTimeout(callback, debounceTime);
      } else {
        callback();
      }
      inputTypingDebounceTimer.current = timer;
      return () => {
        abortController?.abort();
        if (timer) clearTimeout(timer);
      };
    }, [
      isOpen,
      searchTextTrimmed,
      language,
      newUnknownValuesAsKey,
      allowedOptionsAsKey,
      arrayValues,
      maxNumberOfPresentedOptions,
      updateCachedOptions,
      allOptionsLookup,
      searchText,
      allowedOptions
    ]);
    const handleListRef = q2(
      /** @param {HTMLUListElement | null} el */
      (el) => {
        listRef.current = el;
        if (setDropdownRef && !shouldUseTray) {
          setDropdownRef(el);
        }
      },
      [setDropdownRef, shouldUseTray]
    );
    if (!isOpen) {
      return null;
    }
    return (
      // biome-ignore lint/a11y/useFocusableInteractive: <explanation>
      /* @__PURE__ */ u3(
        "ul",
        {
          className: [
            "PreactCombobox-options",
            `PreactCombobox--${theme}`,
            shouldUseTray ? "PreactCombobox-options--tray" : ""
          ].filter(Boolean).join(" "),
          role: "listbox",
          id: `${id}-options-listbox`,
          "aria-multiselectable": multiple ? "true" : void 0,
          hidden: !isOpen,
          ref: handleListRef,
          children: isLoading ? /* @__PURE__ */ u3("li", { className: "PreactCombobox-option", "aria-disabled": true, children: loadingRenderer(translations.loadingOptions) }) : /* @__PURE__ */ u3(k, { children: [
            addNewOptionVisible && /* @__PURE__ */ u3(
              "li",
              {
                id: `${id}-option-${toHTMLId(searchTextTrimmed)}`,
                className: `PreactCombobox-option ${activeDescendant === searchTextTrimmed ? "PreactCombobox-option--active" : ""}`,
                role: "option",
                tabIndex: -1,
                "aria-selected": false,
                onMouseEnter: () => setActiveDescendant(searchTextTrimmed),
                onMouseDown: (e3) => {
                  e3.preventDefault();
                  e3.stopPropagation();
                  onOptionSelect(searchTextTrimmed);
                  if (!multiple && onClose) {
                    onClose();
                  }
                },
                children: translations.addOption.replace("{value}", searchTextTrimmed)
              },
              searchTextTrimmed
            ),
            filteredOptions.map((option) => {
              const isActive = activeDescendant === option.value;
              const isSelected = arrayValues.includes(option.value);
              const isInvalid = invalidValues.includes(option.value);
              const isDisabled = option.disabled;
              const hasDivider = option.divider && !searchTextTrimmed;
              const optionClasses = [
                "PreactCombobox-option",
                isActive ? "PreactCombobox-option--active" : "",
                isSelected ? "PreactCombobox-option--selected" : "",
                isInvalid ? "PreactCombobox-option--invalid" : "",
                isDisabled ? "PreactCombobox-option--disabled" : "",
                hasDivider ? "PreactCombobox-option--divider" : ""
              ].filter(Boolean).join(" ");
              return /* @__PURE__ */ u3(
                "li",
                {
                  id: `${id}-option-${toHTMLId(option.value)}`,
                  className: optionClasses,
                  role: "option",
                  tabIndex: -1,
                  "aria-selected": isSelected,
                  "aria-disabled": isDisabled,
                  onMouseEnter: () => !isDisabled && setActiveDescendant(option.value),
                  onMouseDown: (e3) => {
                    e3.preventDefault();
                    e3.stopPropagation();
                    onOptionSelect(option.value, { toggleSelected: true });
                    if (!multiple && onClose) {
                      onClose();
                    }
                  },
                  children: [
                    optionRenderer({
                      option,
                      language,
                      isActive,
                      isSelected,
                      isInvalid,
                      showValue,
                      warningIcon,
                      tickIcon,
                      optionIconRenderer
                    }),
                    isSelected ? /* @__PURE__ */ u3(
                      "span",
                      {
                        className: "PreactCombobox-srOnly",
                        "aria-atomic": "true",
                        "data-reader": "selected",
                        "aria-hidden": !isActive,
                        children: translations.selectedOption
                      }
                    ) : null,
                    isInvalid ? /* @__PURE__ */ u3(
                      "span",
                      {
                        className: "PreactCombobox-srOnly",
                        "aria-atomic": "true",
                        "data-reader": "invalid",
                        "aria-hidden": !isActive,
                        children: translations.invalidOption
                      }
                    ) : null
                  ]
                },
                option.value
              );
            }),
            filteredOptions.length === 0 && !isLoading && (!allowFreeText || !searchText || arrayValues.includes(searchText)) && /* @__PURE__ */ u3("li", { className: "PreactCombobox-option", children: translations.noOptionsFound }),
            filteredOptions.length === maxNumberOfPresentedOptions && /* @__PURE__ */ u3("li", { className: "PreactCombobox-option", children: translations.typeToLoadMore })
          ] })
        }
      )
    );
  }
);
var AutocompleteList_default = AutocompleteList;
//# sourceMappingURL=AutocompleteList.js.map
