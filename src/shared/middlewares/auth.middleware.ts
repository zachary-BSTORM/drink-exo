import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {Request,Response,NextFunction} from 'express'

export function authMiddleware(jwtService : JwtService){
  return (req : Request , res : Response , next  : NextFunction) => {
    const token = req.headers.authorization?.replace('Bearer ' , '')

    if(!token){
      return next()
    }

    try{
        const payload = jwtService.verify(token)

        Object.assign(req , {user : payload})
        next()
    }catch{
      return res.status(401).send('Invalid token')
    }
  }
}