// Emulates native React Native RTL on react-native-web, for the Arabic
// captures only. On a phone, Yoga mirrors the whole layout in RTL and also
// swaps physical left/right (margin, padding, position, borders, textAlign);
// the web build does neither. `dir="rtl"` gives the mirrored flex rows, and
// every left/right in styles is swapped so the result matches the device.
(() => {
  const setDir = () => {
    const html = document.documentElement;
    if (html && html.getAttribute('dir') !== 'rtl') html.setAttribute('dir', 'rtl');
  };
  setDir();
  document.addEventListener('DOMContentLoaded', setDir);
  new MutationObserver(setDir).observe(document, { childList: true, subtree: true, attributes: true, attributeFilter: ['dir'] });

  const swapWord = (s) => s.replace(/left|right|Left|Right/g, (m) => ({ left: 'right', right: 'left', Left: 'Right', Right: 'Left' }[m]));
  const isSidedProp = (p) => /(^|-)(left|right)(-|$)/.test(p) || /(Left|Right)/.test(p);
  const flipDecls = (body) => body.replace(/([a-zA-Z-]+)\s*:\s*([^;}]+)/g, (all, prop, val) => {
    if (prop === 'text-align' || prop === 'textAlign') return `${prop}:${swapWord(val)}`;
    if (isSidedProp(prop) && !/^-?webkit/i.test(prop)) return `${swapWord(prop)}:${val}`;
    return all;
  });
  const flipRule = (rule) => {
    const i = rule.indexOf('{');
    return i < 0 ? rule : rule.slice(0, i) + flipDecls(rule.slice(i));
  };

  const ins = CSSStyleSheet.prototype.insertRule;
  CSSStyleSheet.prototype.insertRule = function (rule, index) { return ins.call(this, flipRule(rule), index); };

  const mapProp = (p) => (typeof p === 'string' && isSidedProp(p) ? swapWord(p) : p);
  const mapVal = (p, v) => ((p === 'textAlign' || p === 'text-align') && typeof v === 'string' ? swapWord(v) : v);
  const proxies = new WeakMap();
  const styleDesc = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'style');
  Object.defineProperty(HTMLElement.prototype, 'style', {
    configurable: true,
    get() {
      const real = styleDesc.get.call(this);
      let proxy = proxies.get(real);
      if (!proxy) {
        proxy = new Proxy(real, {
          get(t, p) {
            if (p === 'setProperty') return (name, v, pr) => t.setProperty(mapProp(name), mapVal(name, v), pr);
            if (p === 'cssText') return t.cssText;
            const v = t[mapProp(p)];
            return typeof v === 'function' ? v.bind(t) : v;
          },
          set(t, p, v) {
            if (p === 'cssText') { t.cssText = flipDecls(String(v)); return true; }
            t[mapProp(p)] = mapVal(p, v);
            return true;
          },
        });
        proxies.set(real, proxy);
      }
      return proxy;
    },
    set(v) { styleDesc.set.call(this, v); },
  });
  const setAttr = Element.prototype.setAttribute;
  Element.prototype.setAttribute = function (n, v) { return setAttr.call(this, n, n === 'style' ? flipDecls(String(v)) : v); };
})();
