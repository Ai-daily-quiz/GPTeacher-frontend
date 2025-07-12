import supabase from '../../supabase';

const LoginModal = ({ user }) => {
  const handleGoogleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: {
          prompt: 'select_account',
        },
      },
    });
    if (error) console.error('로그인 에러:', error);
  };

  const handleKakaoLogin = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        scopes: ['profile_nickname', 'profile_image'],
        redirectTo: window.location.origin,
        queryParams: {
          prompt: 'select_account',
        },
      },
    });
    if (error) console.error('로그인 에러:', error);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('로그아웃 에러:', error);
  };

  // 로그인된 경우 로그아웃 버튼만 표시
  // LoginModal.jsx에서 로그아웃 버튼 부분
  if (user) {
    return (
      <button
        onClick={handleLogout}
        className="bg-white text-gray-700 px-4 py-2.5 rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 hover:scale-110 transform"
      >
        로그아웃
      </button>
    );
  }

  // 로그인되지 않은 경우 소셜 로그인 버튼들 표시
  return (
    <div className="flex gap-3 justify-center">
      {/* 카카오 로그인 */}
      <button
        onClick={handleKakaoLogin}
        className="w-12 h-12 bg-[#ffeb3b] hover:bg-yellow-500 rounded-full shadow-lg flex items-center justify-center transition-all transform hover:scale-110 p-0"
        title="카카오 로그인"
      >
        <img
          src="https://cdn-icons-png.flaticon.com/512/4494/4494622.png"
          alt="Kakao"
          className="w-full h-full object-contain"
        />
      </button>

      {/* 구글 로그인 */}
      <button
        onClick={handleGoogleLogin}
        className="w-12 h-12 bg-white hover:bg-gray-100 rounded-full shadow-lg flex items-center justify-center transition-all transform hover:scale-110 border border-gray-200 p-2"
        title="구글 로그인"
      >
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/1200px-Google_%22G%22_logo.svg.png"
          alt="Google"
          className="w-full h-full object-contain"
        />
      </button>
    </div>
  );
};

export default LoginModal;
