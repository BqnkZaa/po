import React from 'react';

export default function Header() {
    return (
        <div className="bg-[#1a3dbf] text-white p-3 sm:p-4 text-center w-full shadow-md">
            <h1 className="text-base sm:text-lg md:text-xl font-bold leading-tight mb-1">บริษัท ตรีเอกอุตสาหกรรมอาหาร จำกัด (สำนักงานใหญ่)</h1>
            <p className="text-xs sm:text-sm text-balance px-4 opacity-90">19/12 ถ.หนองประทีป ต.หนองป่าครั่ง อ.เมือง จ.เชียงใหม่ 50000</p>
            <p className="text-xs sm:text-sm mt-0.5 opacity-80">เลขประจำตัวผู้เสียภาษีอากร 0-5055-66007-95-9</p>
        </div>
    );
}
