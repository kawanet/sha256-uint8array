#!/usr/bin/env mocha -R spec

import {strict as assert} from "assert";
import * as crypto from "crypto";
import {createHash} from "../";

const TITLE = __filename.split("/").pop();

describe(TITLE, () => {
    it('createHash("invalid")', () => {
        assert.throws(() => crypto.createHash("invalid"));

        assert.throws(() => createHash("invalid"));
    });

    it('createHash("sha256")', () => {
        assert.doesNotThrow(() => crypto.createHash("sha256"));

        assert.doesNotThrow(() => createHash("sha256"));
    });

    it('createHash("SHA256")', () => {
        assert.doesNotThrow(() => crypto.createHash("SHA256"));

        assert.doesNotThrow(() => createHash("SHA256"));
    });

    it('createHash(undefined)', () => {
        assert.throws(() => crypto.createHash(undefined));

        assert.doesNotThrow(() => createHash(undefined));
    });
});
