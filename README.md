    Warning: Beta version

# pepperpass

This is a simple apps to salt keyword.

I have always the same problem, I have some strong passwords for the important websites (mail, banks, etc...).
But it's very annoying for junk sites to remember unique passwords. Often we create a password for the websites and we don't use it for several months.
This is a generator of unique password for junk sites. You have only to remember a unique password.

*Warning*: just use it for website with no critical informations.

The formula to make this transformation is:

    Trunk16(SHA-512(password + ctx_identifier)) = unique password

## hasher

The hash library is [jsSHA](https://github.com/Caligatio/jsSHA).
