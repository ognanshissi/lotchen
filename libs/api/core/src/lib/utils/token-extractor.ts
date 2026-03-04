export const extractTokenFromHeader = (request: any): string | undefined => {
  const [type, token] = request.headers.authorization?.split(' ') ?? [];
  return type === 'Bearer' ? token : undefined;
};

export default extractTokenFromHeader;
