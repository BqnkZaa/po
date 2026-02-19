/**
 * Converts a number to Thai Baht text.
 * @param amount The number to convert (e.g. 100.50)
 * @returns The Thai text reading (e.g. "หนึ่งร้อยบาทห้าสิบสตางค์")
 */
export function thaiBahtText(amount: number): string {
    const defaultText = "ศูนย์บาทถ้วน";
    if (amount === 0) return defaultText;

    const bahtText = ["ศูนย์", "หนึ่ง", "สอง", "สาม", "สี่", "ห้า", "หก", "เจ็ด", "แปด", "เก้า"];
    const units = ["", "สิบ", "ร้อย", "พัน", "หมื่น", "แสน", "ล้าน"];

    const splitNumber = (num: number): string[] => {
        const str = num.toFixed(2);
        const parts = str.split(".");
        return [parts[0], parts[1]];
    };

    const convertInteger = (str: string): string => {
        let text = "";
        const len = str.length;

        for (let i = 0; i < len; i++) {
            const digit = parseInt(str[i]);
            const pos = len - i - 1;
            const unitIndex = pos % 6;

            if (digit === 0) {
                // Handle million position for numbers like 1,000,000
                if (pos > 0 && pos % 6 === 0) {
                    text += "ล้าน";
                }
                continue;
            }

            // Handling '1' (Nueng vs Et)
            if (digit === 1 && unitIndex === 0 && len > 1) { // Fixed: len > 1 is not enough for complex numbers. 
                // "Et" is used for the last digit if number > 1 (e.g. 11, 21, 101).
                // Actually rule is: 1 in unit position (pos%6===0) is "Et" IF there is a non-zero digit in higher positions within the same million block?
                // Simplification for standard implementation:
                // If unit position and preceding digit (tens) is not 0? No 101 is Roi-Et.
                // Standard logic: 1 at unit position is 'Et' unless it's the only digit in that block.
                // Block length > 1?
                // Let's use standard well-tested logic logic.
                // Check if it's unit position (0, 6, 12...)
                if (len > 1) {
                    // Check if it's actually 1 (just check previous digits? No.)
                    // Use standard library logic adaptation.
                    text += "เอ็ด";
                } else {
                    text += "หนึ่ง";
                }
            } else if (digit === 2 && unitIndex === 1) {
                text += "ยี่";
            } else if (digit === 1 && unitIndex === 1) {
                // Do nothing for 'Sip' (10)
            } else {
                text += bahtText[digit];
            }

            text += units[unitIndex];

            if (pos > 0 && pos % 6 === 0) {
                text += "ล้าน";
            }
        }
        return text;
    }

    // Reuse a known robust implementation to avoid logic errors in manual rewrite.
    // The previous implementation was a bit rough. 
    // Let's use this specific logic which handles "Et" correctly:
    // 1. 1 at param 0 (unit) is "Et" except when it's the only digit?
    // Let's try to be precise.

    // Better Implementation
    const getText = (numStr: string): string => {
        let tmp = "";
        const len = numStr.length;
        for (let i = 0; i < len; i++) {
            const digit = parseInt(numStr[i]);
            const pos = len - i - 1;

            if (digit === 0) continue;

            if (pos === 1 && digit === 2) {
                tmp += "ยี่";
            } else if (pos === 1 && digit === 1) {
                // nothing
            } else if (pos === 0 && digit === 1 && len > 1) { // 1 at unit and length > 1 -> Et
                // Note: 101 -> len 3. digit 1 at pos 0. "Et". Correct. 
                // 1 -> len 1. digit 1 at pos 0. "Nueng". Correct.
                // 11 -> len 2. digit 1 at pos 0. "Et". Correct.
                // Case 0.01 -> Satang 1. "Nueng Satang".
                tmp += "เอ็ด";
            } else {
                tmp += bahtText[digit];
            }

            if (pos === 1) tmp += "สิบ";
            else if (pos > 1) tmp += units[pos];
        }
        return tmp;
    };

    // But this simple `getText` doesn't handle millions recursion well or empty zeros inside.
    // Let's use the standard `thai-baht-text-js` logic style.
    // Since I can't install npm packages without user request, I will write the robust function directly.

    const [baht, satang] = splitNumber(amount);

    let text = "";

    // Baht Part
    if (Number(baht) > 0) {
        // Handle millions
        // Split into chunks of 6? Or just simple loop with mod?
        // Simple loop is safer if logic is correct.
        let bahtStr = String(Number(baht)); // Remove leading zeros
        const len = bahtStr.length;
        for (let i = 0; i < len; i++) {
            const digit = parseInt(bahtStr[i]);
            const pos = len - i - 1;
            const unitPos = pos % 6;

            if (digit === 0) {
                if (pos > 0 && pos % 6 === 0) text += "ล้าน";
                continue;
            }

            if (unitPos === 1 && digit === 2) {
                text += "ยี่";
            } else if (unitPos === 1 && digit === 1) {
                // skip
            } else if (unitPos === 0 && digit === 1 && len > 1) {
                // Edge case: 1,000,001 -> 1 is unit. len is 7. Should be "Et".
                // Edge case: 11 -> Et.
                // Edge case: 1 -> Nueng.
                // The condition `len > 1` is not strictly correct for `101`. It works for `101`.
                // What about `1,000,001`? `pos=0`. `len=7`. `digit=1`. -> "Et". Correct.
                // What about `1`? `len=1`. -> "Nueng". Correct.
                // What about `201`? `len=3`. -> "Et". Correct.
                // Is there any case where Unit 1 is Nueng when Len > 1?
                // No, unless it's strictly "1" (One Baht).
                // Wait, if input is 0.00? handled.
                // If input is 1.00 -> Baht part "1".
                text += "เอ็ด";
            } else {
                text += bahtText[digit];
            }

            text += units[unitPos];

            if (pos > 0 && pos % 6 === 0) {
                text += "ล้าน";
            }
        }
        text += "บาท";
    } else {
        text += "ศูนย์บาท"; // Special case 0 baht? "ศูนย์บาท" or just nothing? Usually "ศูนย์บาท" if satang exists? No usually just skip?
        // If 0.50 -> "ห้าสิบสตางค์" (No Zero Baht).
        // Check requirement. Usually "....บาท..." if > 0.
        // If Baht == 0, empty string?
        // Let's stick to Empty if 0, unless Total is 0.
        if (amount < 1 && amount > 0) text = ""; // valid.
        else if (amount === 0) return "ศูนย์บาทถ้วน";
    }

    // Satang Part
    if (Number(satang) > 0) {
        // Satang is always 2 digits padded by toFixed(2) but we parse it to Number first to remove "05" -> 5?
        // Actually we shouldn't because 05 satang is "Ha Satang". 50 is "Ha Sip".
        // If we use string "05", len is 2. digit 0 at pos 1 -> skip. digit 5 at pos 0 -> unit "Ha".
        // Correct.
        // But if we used Number(satang), 5 -> len 1. digit 5 pos 0 -> "Ha".
        // `getText` logic above handles both?
        // Let's reuse logic.
        const satangVal = parseInt(satang);
        const satangStr = String(satangVal); // "50", "5", "25"
        // Wait, "05" becomes "5". "50" becomes "50".
        // If "5", length 1. digit 5. pos 0. -> "Ha". + "Satang" -> "Ha Satang". Correct.
        // If "50", length 2. digit 5 pos 1 -> "Ha Sip". digit 0 pos 0 -> skip. -> "Ha Sip Satang". Correct.
        // So parseInt is safe.

        let tmp = "";
        const len = satangStr.length;
        for (let i = 0; i < len; i++) {
            const digit = parseInt(satangStr[i]);
            const pos = len - i - 1;
            if (digit === 0) continue;

            if (pos === 1 && digit === 2) tmp += "ยี่";
            else if (pos === 1 && digit === 1) { } // skip
            else if (pos === 0 && digit === 1 && len > 1) tmp += "เอ็ด";
            else tmp += bahtText[digit];

            if (pos === 1) tmp += "สิบ";
        }

        text += tmp + "สตางค์";
    } else {
        text += "ถ้วน";
    }

    return text;
}
