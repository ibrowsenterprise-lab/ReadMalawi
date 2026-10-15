import assert from 'node:assert/strict';import {DOMParser} from 'linkedom';import * as zip from 'fflate';import {readEPUB} from '../assets/epub-text.js';
globalThis.DOMParser=DOMParser;
const pack=files=>zip.zipSync(Object.fromEntries(Object.entries(files).map(([k,v])=>[k,zip.strToU8(v)])));
const files={'META-INF/container.xml':'<container><rootfiles><rootfile full-path="OPS/book.opf"/></rootfiles></container>','OPS/book.opf':'<package><manifest><item id="one" href="one.xhtml"/></manifest><spine><itemref idref="one"/></spine></package>','OPS/one.xhtml':'<!doctype html><html><head><script>bad()</script></head><body><h1>A story</h1><p>Read safely.</p><script>bad()</script><iframe src="https://example.test"></iframe></body></html>'};
const sections=await readEPUB(pack(files),zip);assert.equal(sections.length,1);assert.match(sections[0],/Read safely/);assert.doesNotMatch(sections[0],/bad\(\)|iframe/);
await assert.rejects(()=>readEPUB(pack({'META-INF/container.xml':'<container/>'}),zip),/directory missing/);
const external={...files,'OPS/book.opf':'<package><manifest><item id="one" href="https://example.test/book.xhtml"/></manifest><spine><itemref idref="one"/></spine></package>'};await assert.rejects(()=>readEPUB(pack(external),zip),/External|missing/);
console.log('PASS: EPUB spine order, safe text extraction, missing structure and external sections');
