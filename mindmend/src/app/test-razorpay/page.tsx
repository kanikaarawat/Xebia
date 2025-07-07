'use client';

import { useEffect, useState } from 'react';

export default function TestRazorpayPage() {
  const [data, setData] = useState<unknown>(null);

  useEffect(() => {
    fetch('/api/test-razorpay', {
      method: 'POST',
    })
      .then((res) => res.json())
      .then((res) => {
        console.log("✅ Razorpay response:", res);
        setData(res);
      })
      .catch((err) => console.error("❌ Fetch error:", err));
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Test Razorpay API</h1>
      <pre className="mt-2 bg-gray-100 p-2 rounded">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
