/// <reference path = "api-auto.d.ts" />
import { request } from 'umi';

/**
* 
*/
export async function AppControllerGetSigninUrl(
  params: Paths.AppControllerGetSigninUrl.BodyParameters,
  extra?: { [key: string]: any },
): Promise<Paths.AppControllerGetSigninUrl.Responses> {
  return request('/v1/login', {
    method: 'GET',
    data: params,
    ...(extra || {}),
  });
}

/**
* 
*/
export async function AppControllerGetSignupUrl(
  params: Paths.AppControllerGetSignupUrl.BodyParameters,
  extra?: { [key: string]: any },
): Promise<Paths.AppControllerGetSignupUrl.Responses> {
  return request('/v1/register', {
    method: 'GET',
    data: params,
    ...(extra || {}),
  });
}

/**
* 
*/
export async function AppControllerCode2token(
  params: Paths.AppControllerCode2token.BodyParameters,
  extra?: { [key: string]: any },
): Promise<Paths.AppControllerCode2token.Responses> {
  return request('/v1/code2token', {
    method: 'GET',
    data: params,
    ...(extra || {}),
  });
}

/**
* 
*/
export async function AppControllerGetProfile(
  params: Paths.AppControllerGetProfile.BodyParameters,
  extra?: { [key: string]: any },
): Promise<Paths.AppControllerGetProfile.Responses> {
  return request('/v1/profile', {
    method: 'GET',
    data: params,
    ...(extra || {}),
  });
}

/**
* 
*/
export async function FunctionsControllerCreate(
  params: Definitions.CreateFunctionDto,
  extra?: { [key: string]: any },
): Promise<Paths.FunctionsControllerCreate.Responses> {
  return request('/v1/apps/{appid}/functions', {
    method: 'POST',
    data: params,
    ...(extra || {}),
  });
}

/**
* 
*/
export async function FunctionsControllerFindOne(
  params: Paths.FunctionsControllerFindOne.BodyParameters,
  extra?: { [key: string]: any },
): Promise<Paths.FunctionsControllerFindOne.Responses> {
  return request('/v1/apps/{appid}/functions/{name}', {
    method: 'GET',
    data: params,
    ...(extra || {}),
  });
}

/**
* 
*/
export async function FunctionsControllerUpdate(
  params: Definitions.UpdateFunctionDto,
  extra?: { [key: string]: any },
): Promise<Paths.FunctionsControllerUpdate.Responses> {
  return request('/v1/apps/{appid}/functions/{id}', {
    method: 'PATCH',
    data: params,
    ...(extra || {}),
  });
}

/**
* 
*/
export async function PoliciesControllerCreate(
  params: Definitions.CreatePolicyDto,
  extra?: { [key: string]: any },
): Promise<Paths.PoliciesControllerCreate.Responses> {
  return request('/v1/apps/{appid}/policies', {
    method: 'POST',
    data: params,
    ...(extra || {}),
  });
}

/**
* 
*/
export async function PoliciesControllerFindOne(
  params: Paths.PoliciesControllerFindOne.BodyParameters,
  extra?: { [key: string]: any },
): Promise<Paths.PoliciesControllerFindOne.Responses> {
  return request('/v1/apps/{appid}/policies/{id}', {
    method: 'GET',
    data: params,
    ...(extra || {}),
  });
}

/**
* 
*/
export async function BucketsControllerCreate(
  params: Definitions.CreateBucketDto,
  extra?: { [key: string]: any },
): Promise<Paths.BucketsControllerCreate.Responses> {
  return request('/v1/apps/{appid}/buckets', {
    method: 'POST',
    data: params,
    ...(extra || {}),
  });
}

/**
* 
*/
export async function BucketsControllerFindOne(
  params: Paths.BucketsControllerFindOne.BodyParameters,
  extra?: { [key: string]: any },
): Promise<Paths.BucketsControllerFindOne.Responses> {
  return request('/v1/apps/{appid}/buckets/{name}', {
    method: 'GET',
    data: params,
    ...(extra || {}),
  });
}

/**
* 
*/
export async function BucketsControllerUpdate(
  params: Definitions.UpdateBucketDto,
  extra?: { [key: string]: any },
): Promise<Paths.BucketsControllerUpdate.Responses> {
  return request('/v1/apps/{appid}/buckets/{id}', {
    method: 'PATCH',
    data: params,
    ...(extra || {}),
  });
}

/**
* 
*/
export async function WebsitesControllerCreate(
  params: Definitions.CreateWebsiteDto,
  extra?: { [key: string]: any },
): Promise<Paths.WebsitesControllerCreate.Responses> {
  return request('/v1/apps/{appid}/websites', {
    method: 'POST',
    data: params,
    ...(extra || {}),
  });
}

/**
* 
*/
export async function WebsitesControllerFindOne(
  params: Paths.WebsitesControllerFindOne.BodyParameters,
  extra?: { [key: string]: any },
): Promise<Paths.WebsitesControllerFindOne.Responses> {
  return request('/v1/apps/{appid}/websites/{id}', {
    method: 'GET',
    data: params,
    ...(extra || {}),
  });
}

/**
* 
*/
export async function CollectionsControllerCreate(
  params: Definitions.CreateCollectionDto,
  extra?: { [key: string]: any },
): Promise<Paths.CollectionsControllerCreate.Responses> {
  return request('/v1/apps/{appid}/collections', {
    method: 'POST',
    data: params,
    ...(extra || {}),
  });
}

/**
* 
*/
export async function CollectionsControllerFindOne(
  params: Paths.CollectionsControllerFindOne.BodyParameters,
  extra?: { [key: string]: any },
): Promise<Paths.CollectionsControllerFindOne.Responses> {
  return request('/v1/apps/{appid}/collections/{name}', {
    method: 'GET',
    data: params,
    ...(extra || {}),
  });
}

/**
* Get application list
*/
export async function ApplicationsControllerCreate(
  params: Definitions.CreateApplicationDto,
  extra?: { [key: string]: any },
): Promise<Paths.ApplicationsControllerCreate.Responses> {
  return request('/v1/applications', {
    method: 'POST',
    data: params,
    ...(extra || {}),
  });
}

/**
* 
*/
export async function ApplicationsControllerFindOne(
  params: Paths.ApplicationsControllerFindOne.BodyParameters,
  extra?: { [key: string]: any },
): Promise<Paths.ApplicationsControllerFindOne.Responses> {
  return request('/v1/applications/{appid}', {
    method: 'GET',
    data: params,
    ...(extra || {}),
  });
}

/**
* 
*/
export async function ApplicationsControllerUpdate(
  params: Definitions.UpdateApplicationDto,
  extra?: { [key: string]: any },
): Promise<Paths.ApplicationsControllerUpdate.Responses> {
  return request('/v1/applications/{id}', {
    method: 'PATCH',
    data: params,
    ...(extra || {}),
  });
}
