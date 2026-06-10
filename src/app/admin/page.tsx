import { loginAction } from "@/lib/adminActions";

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">⛳</div>
          <h1 className="text-2xl font-black text-gray-800">여행의 파도</h1>
          <p className="text-gray-500 text-sm mt-1">관리자 로그인</p>
        </div>

        <form action={loginAction} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              비밀번호
            </label>
            <input
              type="password"
              name="password"
              placeholder="관리자 비밀번호 입력"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-emerald-500"
              autoFocus
            />
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-base transition-colors"
          >
            로그인
          </button>
        </form>
      </div>
    </div>
  );
}
