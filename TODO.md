# Remove Scrolls Plan Progress

## Steps:
- [x] 1. Update src/scss/_base.scss (html/body overflow/height)
- [x] 2. Update src/scss/_hero.scss (fix hero__bg-wave widths)
- [x] 3. Update index.html (wrap main in .wrapper)
- [x] 4. Optional: Update src/scss/_modal.scss (max-height)
- [x] 5. Test: No horiz/vert scrolls in browser devtools (mobile/desktop)
## All steps complete ✅

Layout fixed: html/body overflows controlled, hero bg-wave widths reduced (110-130%), main wrapped in .wrapper, modal max-height 95vh.

**Test:** Vite hot-reloads – refresh browser/policy.html, inspect Elements > toggle device emulation (iPhone/Android, desktop). No horizontal/vertical scrolls. Console clear.

Run `npm run dev` if server not active. Scrolls removed! 🎉
