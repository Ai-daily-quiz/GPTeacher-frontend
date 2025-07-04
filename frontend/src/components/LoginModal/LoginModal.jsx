import supabase from '../../supabase';

const LoginModal = () => {
  const handleGoogleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) console.error('로그인 에러:', error);
  };
  const handleKakaoLogin = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        scope: ['profile_nickname', 'profile_image'],
        redirectTo: window.location.origin,
      },
    });

    if (error) console.error('로그인 에러:', error);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('로그아웃 에러:', error);
  };

  return (
    <div>
      <button onClick={handleGoogleLogin}>Google 로그인</button>
      <button onClick={handleKakaoLogin}>카카오 로그인</button>
      <button onClick={handleLogout}>로그아웃</button>
    </div>
  );
};

export default LoginModal;
