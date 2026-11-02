import {test} from 'node:test';import assert from 'node:assert/strict';import {isGoogleSuperAdmin,SUPER_ADMIN_EMAIL} from '../lib/google.ts';
test('removed Google account cannot authenticate',()=>{assert.equal(SUPER_ADMIN_EMAIL,'');assert.equal(isGoogleSuperAdmin({email:'someone@example.com'},'token'),false);});
