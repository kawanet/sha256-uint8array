#!/usr/bin/env mocha -R spec

import {strict as assert} from "assert";
import * as crypto from "crypto";
import {createHash} from "../";

const TITLE = __filename.split("/").pop()!!;

/**
 * Unicode's surrogate pair is a pair of 16bit characters in JavaScript.
 * The first half and the second may be separated to different chunks to input.
 */

describe(TITLE, () => {

    const emojis = [
        "\u{1F601}", // 😁 GRINNING FACE WITH SMILING EYES
        "\u{1F602}", // 😂 FACE WITH TEARS OF JOY
        "\u{1F603}", // 😃 SMILING FACE WITH OPEN MOUTH
        "\u{1F604}", // 😄 SMILING FACE WITH OPEN MOUTH AND SMILING EYES
        "\u{1F605}", // 😅 SMILING FACE WITH OPEN MOUTH AND COLD SWEAT
        "\u{1F606}", // 😆 SMILING FACE WITH OPEN MOUTH AND TIGHTLY-CLOSED EYES
        "\u{1F609}", // 😉 WINKING FACE
        "\u{1F60A}", // 😊 SMILING FACE WITH SMILING EYES
        "\u{1F60B}", // 😋 FACE SAVOURING DELICIOUS FOOD
        "\u{1F60C}", // 😌 RELIEVED FACE
        "\u{1F60D}", // 😍 SMILING FACE WITH HEART-SHAPED EYES
        "\u{1F60F}", // 😏 SMIRKING FACE
        "\u{1F612}", // 😒 UNAMUSED FACE
        "\u{1F613}", // 😓 FACE WITH COLD SWEAT
        "\u{1F614}", // 😔 PENSIVE FACE
        "\u{1F616}", // 😖 CONFOUNDED FACE
        "\u{1F618}", // 😘 FACE THROWING A KISS
        "\u{1F61A}", // 😚 KISSING FACE WITH CLOSED EYES
        "\u{1F61C}", // 😜 FACE WITH STUCK-OUT TONGUE AND WINKING EYE
        "\u{1F61D}", // 😝 FACE WITH STUCK-OUT TONGUE AND TIGHTLY-CLOSED EYES
        "\u{1F61E}", // 😞 DISAPPOINTED FACE
        "\u{1F620}", // 😠 ANGRY FACE
        "\u{1F621}", // 😡 POUTING FACE
        "\u{1F622}", // 😢 CRYING FACE
        "\u{1F623}", // 😣 PERSEVERING FACE
        "\u{1F624}", // 😤 FACE WITH LOOK OF TRIUMPH
        "\u{1F625}", // 😥 DISAPPOINTED BUT RELIEVED FACE
        "\u{1F628}", // 😨 FEARFUL FACE
        "\u{1F629}", // 😩 WEARY FACE
        "\u{1F62A}", // 😪 SLEEPY FACE
        "\u{1F62B}", // 😫 TIRED FACE
        "\u{1F62D}", // 😭 LOUDLY CRYING FACE
        "\u{1F630}", // 😰 FACE WITH OPEN MOUTH AND COLD SWEAT
        "\u{1F631}", // 😱 FACE SCREAMING IN FEAR
        "\u{1F632}", // 😲 ASTONISHED FACE
        "\u{1F633}", // 😳 FLUSHED FACE
        "\u{1F635}", // 😵 DIZZY FACE
        "\u{1F637}", // 😷 FACE WITH MEDICAL MASK
    ];

    it("offset 1", testFor(1));
    it("offset 2", testFor(2));
    it("offset 3", testFor(3));
    it("offset 4", testFor(4));
    it("offset 5", testFor(5));
    it("offset 6", testFor(6));
    it("offset 7", testFor(7));

    function testFor(offset: number) {
        return () => {
            const input = "123456789".substr(-offset) + emojis.join("");
            assert.equal(input.length, emojis.length * 2 + offset);

            const expected = crypto.createHash("sha256").update(input).digest("hex");
            assert.equal(createHash().update(input).digest("hex"), expected, "update only once");

            const hash = createHash();
            input.split("").forEach(c => hash.update(c));
            assert.equal(hash.digest("hex"), expected, "update for each character");
        };
    }
});
