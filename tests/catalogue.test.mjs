import assert from 'node:assert/strict';
import {cleanBook,loadPublicCatalogue,scoreBooks,reviewIssues} from '../assets/catalogue-tools.js';
const b=cleanBook({title:'[Joseph J. Luciani] Self-Coaching The Powerful Pr(BookFi)',author:'Unknown'});
assert.equal(b.title,'Self-Coaching The Powerful Pr');assert.equal(b.author,'Unknown');assert.equal(b.suggested_author,'Joseph J. Luciani');
const books=[{title:'A Question of Power',author:'Bessie Head',category:'Fiction',language:'English'},{title:'English Grammar',author:'Espresso English',category:'Language',language:'English'},{title:'Business Plan ya chichewa',author:'Unknown',category:'Education',language:'Chichewa'}];
assert.equal(scoreBooks(books,'Bessie')[0].book.title,'A Question of Power');assert.equal(scoreBooks(books,'Recommend a short African novel for a beginner and explain why.')[0].book.title,'A Question of Power');assert.equal(scoreBooks(books,'Chichewa')[0].book.title,'Business Plan ya chichewa');assert.equal(scoreBooks(books,'zzzznotabook').length,0);
assert.equal(reviewIssues({title:'BOOK',author:'Unknown',description:'',language:'Unconfirmed',verified_rights:false}).length,4);
// Simulate a server cap smaller than the requested page size: must continue to an empty page.
let calls=0;global.fetch=async url=>{calls++;const offset=Number(new URL(url).searchParams.get('offset'));const data=Array.from({length:Math.max(0,Math.min(2,5-offset))},(_,i)=>({id:String(offset+i),title:'Book '+(offset+i)}));return {ok:true,json:async()=>data}};
const out=await loadPublicCatalogue({supabaseUrl:'https://example.test',supabasePublishableKey:'test'});assert.equal(out.length,5);assert.equal(calls,4);
global.fetch=async()=>({ok:true,json:async()=>[{id:'same'}]});await assert.rejects(()=>loadPublicCatalogue({supabaseUrl:'https://example.test'}),/did not advance/);
console.log('PASS: catalogue cleanup, recommendations, missing-book results, review flags, capped pagination and non-advancing responses');
